#!/usr/bin/env bash
# Build the typescript shim. This outputs a single file, ic_agent.js.
set -euo pipefail

TS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOPLEVEL="$TS_DIR/../../"

cd "$TOPLEVEL"

# Check that the DEPLOY_ENV is set
DEPLOY_ENV="${DEPLOY_ENV:-${DFX_NETWORK:-}}"

DEPLOY_ENV="$DEPLOY_ENV" jq -e '.networks[env.DEPLOY_ENV]' dfx.json || {
  echo "Which deployment environment? Set DEPLOY_ENV to one of:"
  jq -er '.networks | keys | join("  ")' dfx.json
  exit 1
} >&2

# Create config file with proper configurations.
./config.sh

cd "$TS_DIR"

npm ci
npx tsc
echo "Bundling..."
# Unfortunately dart relies on ic_agent.js at build time so we have to actually
# modify the codebase
npx browserify ./build/index.js --standalone IcAgent | npx uglifyjs >../dart/assets/ic_agent.js
echo "Done."
