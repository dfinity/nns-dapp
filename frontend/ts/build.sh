#!/usr/bin/env bash
set -e

if ! [[ $DEPLOY_ENV = "testnet" ]] && ! [[ $DEPLOY_ENV = "mainnet" ]]; then
  echo "Which deployment environment? Set DEPLOY_ENV to 'testnet' or 'mainnet'"
  exit 1
fi

npm ci

# Create config file with proper configurations.
pushd "$(dirname "$0")"
cd ../..
./update_config.sh
popd

npx tsc
echo "Bundling..."
npx browserify ./build/index.js --standalone IcAgent | npx uglify-js --compress --mangle > ../dart/assets/ic_agent.js
echo "Done."
