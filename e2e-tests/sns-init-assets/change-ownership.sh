#!/bin/bash

SNS_ROOT=$1
PRINCIPAL=$(dfx identity --network "$DFX_NETWORK" get-principal)

if test -z "$SNS_ROOT" 
then
      echo "change-ownership.sh takes one argument: root-canister-id. Ex: $ ./change-ownership.sh <your-sns-root-canister-id>"
      exit
fi

if test -z "$WALLET_CANISTER" 
then
      echo "\$WALLET_CANISTER is not set. Set it via 'export WALLET_CANISTER=<your-wallet-canister>"
      exit
fi

if test -z "$DAPP_BACKEND" 
then
      echo "\$DAPP_BACKEND is not set. Set it via 'export DAPP_BACKEND=<your-dapp-backend-canister>"
      exit
fi

if test -z "$DAPP_FRONTEND" 
then
      echo "\$DAPP_FRONTEND is not set. Set it via 'export DAPP_FRONTEND=<your-dapp-frontend-canister>"
      exit
fi

dfx canister --network $DFX_NETWORK status $DAPP_BACKEND
dfx canister --network $DFX_NETWORK status $DAPP_FRONTEND
dfx canister --network $DFX_NETWORK update-settings $DAPP_BACKEND --add-controller $SNS_ROOT
dfx canister --network $DFX_NETWORK update-settings $DAPP_BACKEND --remove-controller $WALLET_CANISTER
dfx canister --network $DFX_NETWORK update-settings $DAPP_BACKEND --remove-controller $PRINCIPAL
dfx canister --network $DFX_NETWORK update-settings $DAPP_FRONTEND --add-controller $SNS_ROOT
dfx canister --network $DFX_NETWORK update-settings $DAPP_FRONTEND --remove-controller $WALLET_CANISTER
dfx canister --network $DFX_NETWORK update-settings $DAPP_FRONTEND --remove-controller $PRINCIPAL
dfx canister --network $DFX_NETWORK call sns-root register_dapp_canister "(record {canister_id = opt principal \"${DAPP_BACKEND}\" } )"
dfx canister --network $DFX_NETWORK call sns-root register_dapp_canister "(record {canister_id = opt principal \"${DAPP_FRONTEND}\" } )"
dfx canister --network $DFX_NETWORK call sns-root list_sns_canisters '(record {} )'
