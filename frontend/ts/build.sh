#!/usr/bin/env bash
set -e

if ! [[ $DEPLOY_ENV = "xsmallh" ]] && ! [[ $DEPLOY_ENV = "mainnet" ]]; then
  echo "Which deployment environment? Set DEPLOY_ENV to 'xsmallh' or 'mainnet'"
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
npx browserify ./build/index.js --standalone DfinityAgent > ../dart/assets/dfinity_agent.js
echo "Done."
