set -e


if ! [[ $DEPLOY_ENV = "xsmallh" ]] && ! [[ $DEPLOY_ENV = "mainnet" ]]; then
  echo "Which deployment environment? Set DEPLOY_ENV to 'xsmallh' or 'mainnet'"
	exit 1
fi

if [[ $DEPLOY_ENV = "xsmallh" ]]; then
    # xsmallh config
    cat > js-agent/src/config.json << EOF
{
    "IDENTITY_SERVICE_URL": "https://qjdve-lqaaa-aaaaa-aaaeq-cai.xsmallh.dfinity.network/",
    "HOST": "https://xsmallh.dfinity.network/",
    "OWN_CANISTER_ID": "$(dfx canister --no-wallet --network xsmallh id nns_ui)",
    "FETCH_ROOT_KEY": true
}
EOF

else
    # mainnet config
    cat > js-agent/src/config.json << EOF
{
    "IDENTITY_SERVICE_URL": "https://identity.ic0.app/",
    "OWN_CANISTER_ID": "qoctq-giaaa-aaaaa-aaaea-cai",
    "FETCH_ROOT_KEY": false
}
EOF
fi
