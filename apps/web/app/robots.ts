import { serverEnv } from "@cap/env";
import type { MetadataRoute } from "next";

export default async function robots(): Promise<MetadataRoute.Robots> {
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: [
					"/dashboard",
					"/login",
					"/invite",
					"/onboarding",
					"/record",
					"/home",
				],
			},
		],
		sitemap: `${serverEnv().WEB_URL}/sitemap.xml`,
	};
}
