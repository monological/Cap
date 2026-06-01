import { serverEnv } from "@cap/env";

export default async function sitemap() {
	return [
		{
			url: serverEnv().WEB_URL,
			lastModified: new Date().toISOString(),
		},
	];
}
