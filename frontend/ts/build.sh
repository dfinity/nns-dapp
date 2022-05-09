#!/usr/bin/env bash
# Build the typescript shim. This outputs a single file, ic_agent.js.
set -euo pipefail

TS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOPLEVEL="$TS_DIR/../../"

# Check that the DEPLOY_ENV is set
DEPLOY_ENV="${DEPLOY_ENV:-}"
if ! [[ $DEPLOY_ENV = "testnet" ]] && ! [[ $DEPLOY_ENV = "mainnet" ]] && ! [[ $DEPLOY_ENV = "local" ]]; then
  echo "Which deployment environment? Set DEPLOY_ENV to 'testnet' or 'mainnet' or 'local'"
  exit 1
fi

cd "$TOPLEVEL"
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
