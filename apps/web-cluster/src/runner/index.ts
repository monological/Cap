import { createServer } from "node:http";
import { Database, S3Buckets, Videos, Workflows } from "@cap/web-backend";
import { ClusterWorkflowEngine, RunnerAddress } from "@effect/cluster";
import {
	FetchHttpClient,
	Headers,
	HttpRouter,
	HttpServer,
} from "@effect/platform";
import {
	NodeClusterRunnerSocket,
	NodeHttpServer,
	NodeRuntime,
} from "@effect/platform-node";
import { RpcServer } from "@effect/rpc";
import { WorkflowProxyServer } from "@effect/workflow";
import { Config, Effect, Layer, Option } from "effect";

import { ContainerMetadata } from "../cluster/container-metadata.ts";
import { DatabaseLive, ShardDatabaseLive } from "../shared/database.ts";
import { HealthServerLive } from "./health-server.ts";

class RpcAuthSecret extends Effect.Service<RpcAuthSecret>()("RpcAuthSecret", {
	effect: Effect.map(Config.string("WORKFLOWS_RPC_SECRET"), (v) => ({
		authSecret: v,
	})),
}) {}

const ClusterWorkflowLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		const containerMeta = yield* ContainerMetadata;
		return ClusterWorkflowEngine.layer.pipe(
			Layer.provide(
				NodeClusterRunnerSocket.layer({
					storage: "sql",
					shardingConfig: {
						runnerAddress: Option.some(
							RunnerAddress.make(containerMeta.ipAddress, containerMeta.port),
						),
					},
				}),
			),
			Layer.provide(ShardDatabaseLive),
		);
	}),
).pipe(Layer.provide(ContainerMetadata.Default));

const RpcsLive = RpcServer.layer(Workflows.RpcGroup).pipe(
	Layer.provide(WorkflowProxyServer.layerRpcHandlers(Workflows.Workflows)),
	Layer.provide(Workflows.WorkflowsLayer),
	Layer.provide(ClusterWorkflowLive),
	Layer.provide(RpcServer.layerProtocolHttp({ path: "/" })),
	Layer.provide(
		Layer.effect(
			Workflows.SecretAuthMiddleware,
			Effect.gen(function* () {
				const { authSecret } = yield* RpcAuthSecret;

				return Workflows.SecretAuthMiddleware.of(
					Effect.fn(function* (options) {
						const authHeader = Headers.get(options.headers, "authorization");
						if (Option.isNone(authHeader) || authHeader.value !== authSecret) {
							if (Option.isNone(authHeader))
								yield* Effect.log("No auth header provided");

							return yield* new Workflows.InvalidRpcAuth();
						}

						return yield* options.next;
					}),
				);
			}),
		),
	),
	Layer.provide(Workflows.RpcSerialization),
);

HttpRouter.Default.serve().pipe(
	Layer.provide(RpcsLive),
	HttpServer.withLogAddress,
	Layer.provide(NodeHttpServer.layer(createServer, { port: 42169 })),
	Layer.provide(Videos.Default),
	Layer.provide(S3Buckets.Default),
	Layer.provide(Database.Default),
	Layer.provide(FetchHttpClient.layer),
	Layer.provide(DatabaseLive),
	Layer.provide(RpcAuthSecret.Default),
	Layer.launch,
	NodeRuntime.runMain,
);

HealthServerLive.pipe(Layer.launch, NodeRuntime.runMain);
