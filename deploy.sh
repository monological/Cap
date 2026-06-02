#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_NAME="${APP_NAME:-Cap}"
APP_PATH="${APP_PATH:-$ROOT_DIR/target/release/bundle/macos/$APP_NAME.app}"
INSTALL_PATH="${INSTALL_PATH:-/Applications/$APP_NAME.app}"
SIGN_IDENTITY="${APPLE_SIGNING_IDENTITY:--}"
ENTITLEMENTS_PATH="${ENTITLEMENTS_PATH:-$ROOT_DIR/apps/desktop/src-tauri/Entitlements.plist}"
TAURI_CONFIG="${TAURI_CONFIG:-}"
BUNDLES="${BUNDLES:-app}"

cd "$ROOT_DIR"

DEPLOY_LOG="${DEPLOY_LOG:-$ROOT_DIR/target/deploy-logs/deploy-$(date +%Y%m%d-%H%M%S).log}"
mkdir -p "$(dirname "$DEPLOY_LOG")"
touch "$DEPLOY_LOG"
exec > >(tee -a "$DEPLOY_LOG") 2>&1
echo "Logging to $DEPLOY_LOG"

if [[ -f "$ROOT_DIR/desktop-env.sh" ]]; then
	source "$ROOT_DIR/desktop-env.sh"
fi

if [[ "$INSTALL_PATH" != *.app ]]; then
	echo "Refusing to install to non-.app path: $INSTALL_PATH" >&2
	exit 1
fi

export CI="${CI:-false}"

if [[ -z "$TAURI_CONFIG" ]]; then
	LOCAL_TAURI_CONFIG_DIR="$(mktemp -d "${TMPDIR:-/tmp}/cap-tauri-local-deploy.XXXXXX")"
	LOCAL_TAURI_CONFIG="$LOCAL_TAURI_CONFIG_DIR/tauri.local.conf.json"
	trap 'rm -rf "$LOCAL_TAURI_CONFIG_DIR"' EXIT
	cat >"$LOCAL_TAURI_CONFIG" <<'JSON'
{
	"$schema": "https://schema.tauri.app/config/2",
	"productName": "Cap",
	"mainBinaryName": "Cap",
	"identifier": "so.cap.desktop",
	"build": {
		"beforeBundleCommand": "node scripts/prodBeforeBundle.js"
	},
	"plugins": {
		"updater": {
			"active": true,
			"endpoints": [
				"https://cdn.crabnebula.app/update/cap/cap/{{target}}-{{arch}}/{{current_version}}"
			],
			"dialog": true,
			"pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IEUyOTAzOTdFNzJFQkRFOTMKUldTVDN1dHlmam1RNHFXb1VYTXlrQk1iMFFkcjN0YitqZlA5WnZNY0ZtQ1dvM1dxK211M3VIYUQK"
		}
	},
	"bundle": {
		"createUpdaterArtifacts": false,
		"macOS": {
			"entitlements": "Entitlements.plist"
		},
		"windows": {
			"wix": {
				"upgradeCode": "a765d9de-0ecc-55d0-b8a0-61e9d3276664"
			}
		}
	}
}
JSON
	TAURI_CONFIG="$LOCAL_TAURI_CONFIG"
fi

pnpm -w cap-setup
pnpm --dir apps/desktop run build:sidecar
pnpm exec dotenv -e .env -- pnpm --dir apps/desktop run preparescript
pnpm exec dotenv -e .env -- pnpm --dir apps/desktop tauri build --verbose --bundles "$BUNDLES" --config "$TAURI_CONFIG"

if [[ ! -d "$APP_PATH" ]]; then
	echo "Expected app bundle not found: $APP_PATH" >&2
	exit 1
fi

if [[ "$SIGN_IDENTITY" == "-" ]]; then
	codesign --force --deep --sign - "$APP_PATH"
else
	codesign --force --deep --options runtime --timestamp --entitlements "$ENTITLEMENTS_PATH" --sign "$SIGN_IDENTITY" "$APP_PATH"
fi

codesign --verify --deep --strict --verbose=2 "$APP_PATH"

if pgrep -x "$APP_NAME" >/dev/null 2>&1; then
	osascript -e "tell application \"$APP_NAME\" to quit" >/dev/null 2>&1 || true
	sleep 2
fi

if [[ -d "$INSTALL_PATH" ]]; then
	rm -rf "$INSTALL_PATH"
fi

if ! ditto "$APP_PATH" "$INSTALL_PATH"; then
	echo "Install failed: $INSTALL_PATH" >&2
	echo "Try: sudo ./deploy.sh" >&2
	exit 1
fi

codesign --verify --deep --strict --verbose=2 "$INSTALL_PATH"

if [[ "${OPEN_AFTER_INSTALL:-0}" == "1" ]]; then
	open "$INSTALL_PATH"
fi

echo "Installed $INSTALL_PATH"
