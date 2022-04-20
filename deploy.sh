#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$(realpath "$0")")" || exit
NETWORK=$1

# Note:  NNS dapp is the only canister provided by this repo, however dfx.json
#        includes other canisters for testing purposes.  If testing you MAY wish
#        to deploy these other canisters as well, but you probbaly don't.
CANISTER_NAME=nns-dapp
echo "Deploying $CANISTER_NAME to $NETWORK..."
DEPLOY_ENV=$NETWORK dfx deploy --network "$NETWORK" "$CANISTER_NAME"
echo "Deployed to: https://$(jq -jc '.["nns-dapp"].testnet' canister_ids.json).nnsdapp.dfinity.network"
