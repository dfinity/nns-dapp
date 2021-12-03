#!/usr/bin/env bash
set -euo pipefail
NETWORK=$1

echo "Deploying to $NETWORK..."
DEPLOY_ENV=$NETWORK dfx deploy --no-wallet --network "$NETWORK"
