set -e


if ! [[ $DEPLOY_ENV = "testnet" ]] && ! [[ $DEPLOY_ENV = "mainnet" ]]; then
  echo "Which deployment environment? Set DEPLOY_ENV to 'testnet' or 'mainnet'"
	exit 1
fi

if [[ $DEPLOY_ENV = "testnet" ]]; then
    # testnet config
    cat > frontend/ts/src/config.json << EOF
{
    "IDENTITY_SERVICE_URL": "https://qjdve-lqaaa-aaaaa-aaaeq-cai.nnsdapp.dfinity.network/",
    "HOST": "https://nnsdapp.dfinity.network/",
    "OWN_CANISTER_ID": "$(dfx canister --no-wallet --network testnet id nns_ui)",
    "FETCH_ROOT_KEY": true
}
EOF

else
    # mainnet config
    cat > frontend/ts/src/config.json << EOF
{
    "IDENTITY_SERVICE_URL": "https://identity.ic0.app/",
    "OWN_CANISTER_ID": "qoctq-giaaa-aaaaa-aaaea-cai",
    "FETCH_ROOT_KEY": false
}
EOF
fi
