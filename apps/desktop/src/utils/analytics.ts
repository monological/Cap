type EventProperties = Record<string, unknown>;

function logLocalEvent(
	type: "init" | "identify" | "track",
	name: string,
	properties?: EventProperties,
): void {
	if (!import.meta.env.DEV) return;

	console.debug(`[analytics disabled] ${type}`, name, properties ?? {});
}

export function initAnonymousUser(): void {
	logLocalEvent("init", "anonymous_user");
}

export function identifyUser(
	userId: string,
	properties?: EventProperties,
): void {
	logLocalEvent("identify", userId, properties);
}

export function trackEvent(
	eventName: string,
	properties?: EventProperties,
): void {
	logLocalEvent("track", eventName, properties);
}
