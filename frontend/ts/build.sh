#!/usr/bin/env bash
set -e

if ! [[ $DEPLOY_ENV = "testnet" ]] && ! [[ $DEPLOY_ENV = "mainnet" ]] && ! [[ $DEPLOY_ENV = "local" ]]; then
  echo "Which deployment environment? Set DEPLOY_ENV to 'testnet' or 'mainnet' or 'local'"
  exit 1
fi

npm ci

pushd "$(dirname "$0")"
cd ../..
# Create config file with proper configurations.
./update_config.sh
popd

npx tsc
echo "Bundling..."
npx browserify ./build/index.js --standalone IcAgent >../dart/assets/ic_agent.js
echo "Done."
