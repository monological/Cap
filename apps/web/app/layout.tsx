import "@/app/globals.css";
import { buildEnv, serverEnv } from "@cap/env";
import { STRIPE_PLAN_IDS } from "@cap/utils";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Effect } from "effect";
import type { Metadata } from "next";
import localFont from "next/font/local";
import type { PropsWithChildren } from "react";
import { SonnerToaster } from "@/components/SonnerToastProvider";
import { runPromise } from "@/lib/server";
import { PublicEnvContext } from "@/utils/public-env";
import { AuthContextProvider } from "./Layout/AuthContext";
import { resolveCurrentUser } from "./Layout/current-user";
import { ReactQueryProvider, SessionProvider } from "./Layout/providers";
import { StripeContextProvider } from "./Layout/StripeContext";
//@ts-expect-error
import { script } from "./themeScript";

const defaultFont = localFont({
	src: [
		{
			path: "../public/fonts/NeueMontreal-Bold.otf",
			weight: "700",
			style: "normal",
		},
		{
			path: "../public/fonts/NeueMontreal-Regular.otf",
			weight: "400",
			style: "normal",
		},
		{
			path: "../public/fonts/NeueMontreal-Medium.otf",
			weight: "500",
			style: "normal",
		},
		{
			path: "../public/fonts/NeueMontreal-MediumItalic.otf",
			weight: "500",
			style: "italic",
		},
		{
			path: "../public/fonts/NeueMontreal-Italic.otf",
			weight: "400",
			style: "italic",
		},
		{
			path: "../public/fonts/NeueMontreal-BoldItalic.otf",
			weight: "700",
			style: "italic",
		},
	],
});

const appName = "Cap";
const appDescription = "Self-hosted video recording and sharing.";
const appUrl = buildEnv.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

export const metadata: Metadata = {
	title: appName,
	description: appDescription,
	openGraph: {
		title: appName,
		description: appDescription,
		type: "website",
		url: appUrl,
	},
	twitter: {
		card: "summary",
		title: appName,
		description: appDescription,
	},
};

export const dynamic = "force-dynamic";

export default ({ children }: PropsWithChildren) =>
	Effect.gen(function* () {
		return (
			<html className={defaultFont.className} lang="en">
				<head>
					<link
						rel="apple-touch-icon"
						sizes="180x180"
						href="/apple-touch-icon.png"
					/>
					<link
						rel="icon"
						type="image/png"
						sizes="32x32"
						href="/favicon-32x32.png"
					/>
					<link
						rel="icon"
						type="image/png"
						sizes="16x16"
						href="/favicon-16x16.png"
					/>
					<link rel="manifest" href="/site.webmanifest" />
					<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
					<link rel="shortcut icon" href="/favicon.ico" />
					<meta name="msapplication-TileColor" content="#da532c" />
					<meta name="theme-color" content="#ffffff" />
				</head>
				<body suppressHydrationWarning>
					<script
						dangerouslySetInnerHTML={{ __html: `(${script.toString()})()` }}
					/>
					<TooltipPrimitive.Provider>
						<AuthContextProvider user={runPromise(resolveCurrentUser)}>
							<SessionProvider>
								<StripeContextProvider
									plans={
										serverEnv().VERCEL_ENV === "production"
											? STRIPE_PLAN_IDS.production
											: STRIPE_PLAN_IDS.development
									}
								>
									<PublicEnvContext
										value={{
											webUrl: buildEnv.NEXT_PUBLIC_WEB_URL,
											workosAuthAvailable: !!serverEnv().WORKOS_CLIENT_ID,
											googleAuthAvailable: !!serverEnv().GOOGLE_CLIENT_ID,
											emailAuthAvailable: !!serverEnv().RESEND_API_KEY,
										}}
									>
										<ReactQueryProvider>
											<SonnerToaster />
											<main className="w-full">{children}</main>
										</ReactQueryProvider>
									</PublicEnvContext>
								</StripeContextProvider>
							</SessionProvider>
						</AuthContextProvider>
					</TooltipPrimitive.Provider>
				</body>
			</html>
		);
	}).pipe(runPromise);
