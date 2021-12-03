#!/usr/bin/env bash
set -e

pushd "$(dirname "$0")" >/dev/null # Move to the script's directory.

if ! [[ $DEPLOY_ENV = "testnet" ]] && ! [[ $DEPLOY_ENV = "mainnet" ]] && ! [[ $DEPLOY_ENV = "local" ]]; then
  echo "Which deployment environment? Set DEPLOY_ENV to 'testnet' or 'mainnet' or 'local'"
  exit 1
fi

if [[ $DEPLOY_ENV = "testnet" ]]; then
  # testnet config
  cat >frontend/ts/src/config.json <<EOF
{
    "IDENTITY_SERVICE_URL": "https://qjdve-lqaaa-aaaaa-aaaeq-cai.nnsdapp.dfinity.network/",
    "HOST": "https://nnsdapp.dfinity.network/",
    "OWN_CANISTER_ID": "$(dfx canister --no-wallet --network testnet id nns-dapp)",
    "FETCH_ROOT_KEY": true
}
EOF

elif [[ $DEPLOY_ENV = "mainnet" ]]; then
  # mainnet config
  cat >frontend/ts/src/config.json <<EOF
{
    "IDENTITY_SERVICE_URL": "https://identity.ic0.app/",
    "OWN_CANISTER_ID": "qoctq-giaaa-aaaaa-aaaea-cai",
    "FETCH_ROOT_KEY": false
}
EOF

else
  # local config
  cat >frontend/ts/src/config.json <<EOF
{
    "IDENTITY_SERVICE_URL": "",
    "HOST": "http://localhost:8080",
    "OWN_CANISTER_ID": "$(dfx canister --no-wallet --network local id nns-dapp)",
    "FETCH_ROOT_KEY": true
}
EOF
fi

popd >/dev/null
