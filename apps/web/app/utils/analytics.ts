type EventProperties = Record<string, unknown>;

const canLogEvents = process.env.NODE_ENV !== "production";

function logLocalEvent(
	type: "init" | "identify" | "track",
	name: string,
	properties?: EventProperties,
) {
	if (!canLogEvents) return;

	console.debug(`[analytics disabled] ${type}`, name, properties ?? {});
}

export function initAnonymousUser() {
	logLocalEvent("init", "anonymous_user");
}

export function identifyUser(userId: string, properties?: EventProperties) {
	logLocalEvent("identify", userId, properties);
}

export function trackEvent(eventName: string, properties?: EventProperties) {
	logLocalEvent("track", eventName, properties);
}
