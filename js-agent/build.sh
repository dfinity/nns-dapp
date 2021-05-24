#!/usr/bin/env bash
set -e

if ! [[ $DEPLOY_ENV = "staging" ]] && ! [[ $DEPLOY_ENV = "production" ]]; then
  echo "Which deployment environment? Set DEPLOY_ENV to 'staging' or 'production'"
	exit 1
fi

# Create config file with proper configurations.
if [[ $DEPLOY_ENV = "staging" ]]; then
	npx gulp create-staging-config
else
	npx gulp create-prod-config
fi

npx tsc
echo "Bundling..."
npx browserify ./build/index.js --standalone DfinityAgent > ../dfinity_wallet/assets/dfinity_agent.js
echo "Done."
