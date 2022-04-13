#!/usr/bin/env bash
set -euo pipefail

pushd "$(dirname "$0")" >/dev/null # Move to the script's directory.

if ! [[ $DEPLOY_ENV = "testnet" ]] && ! [[ $DEPLOY_ENV = "mainnet" ]] && ! [[ $DEPLOY_ENV = "local" ]]; then
  echo "Which deployment environment? Set DEPLOY_ENV to 'testnet' or 'mainnet' or 'local'"
  exit 1
fi

if [[ $DEPLOY_ENV = "testnet" ]]; then
  # testnet config
  OWN_CANISTER_ID="${OWN_CANISTER_ID:-$(dfx canister --network testnet id nns-dapp)}"
  cat >frontend/ts/src/config.json <<EOF
{
    "IDENTITY_SERVICE_URL": "https://qjdve-lqaaa-aaaaa-aaaeq-cai.nnsdapp.dfinity.network/",
    "HOST": "https://nnsdapp.dfinity.network/",
    "OWN_CANISTER_ID": "$OWN_CANISTER_ID",
    "FETCH_ROOT_KEY": true
}
EOF

elif [[ $DEPLOY_ENV = "mainnet" ]]; then
  # mainnet config
  if [ -n "${OWN_CANISTER_ID:-}" ]; then
    echo "OWN_CANISTER_ID is set which is incompatible with mainnet: '$OWN_CANISTER_ID'"
  fi

  cat >frontend/ts/src/config.json <<EOF
{
    "IDENTITY_SERVICE_URL": "https://identity.ic0.app/",
    "OWN_CANISTER_ID": "qoctq-giaaa-aaaaa-aaaea-cai",
    "FETCH_ROOT_KEY": false
}
EOF

else
  # local config
  OWN_CANISTER_ID="${OWN_CANISTER_ID:-$(dfx canister --network local id nns-dapp)}"
  cat >frontend/ts/src/config.json <<EOF
{
    "IDENTITY_SERVICE_URL": "",
    "HOST": "http://localhost:8080",
    "OWN_CANISTER_ID": "$OWN_CANISTER_ID",
    "FETCH_ROOT_KEY": true
}
EOF
fi

echo "wrote config from DEPLOY_ENV '$DEPLOY_ENV' :" >&2
cat frontend/ts/src/config.json

popd >/dev/null
