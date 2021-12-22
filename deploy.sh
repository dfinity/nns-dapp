#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$(realpath "$0")")/.." || exit
NETWORK=$1

echo "Deploying to $NETWORK..."
DEPLOY_ENV=$NETWORK dfx deploy --no-wallet --network "$NETWORK"
echo "Deployed to: https://$(jq -jc '.["nns-dapp"].testnet' canister_ids.json).nnsdapp.dfinity.network"
