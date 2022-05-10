#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$(realpath "$0")")" || exit

help_text() {
  cat <<-EOF
	Deploys the nns-dapp to a network.

	Usage:

	./deploy.sh
	  Creates a local network with the nns-dapp and supporting canisters.

	./deploy.sh <network>
	  Deploys just the nns-dapp to the given network, creating it if necessary.

	Flags:
	--ii
	  Create the internet_identity canister.
	EOF
}

GUESS="true"
JUST_GUESS="false"
START_DFX="false"
DEPLOY_NNS_BACKEND="false"
DEPLOY_II="false"
DEPLOY_NNS_DAPP="false"
OPEN_NNS_DAPP="false"
DFX_NETWORK=local

while (($# > 0)); do
  env="$1"
  shift 1
  case "$env" in
  --help)
    help_text
    exit 0
    ;;
  --start)
    GUESS="false"
    START_DFX="true"
    ;;
  --ii)
    GUESS="false"
    DEPLOY_II="true"
    ;;
  --nns-backend)
    GUESS="false"
    DEPLOY_NNS_BACKEND="true"
    ;;
  --nns-dapp)
    GUESS="false"
    DEPLOY_NNS_DAPP="true"
    ;;
  --open)
    GUESS="false"
    OPEN_NNS_DAPP="true"
    ;;
  --guess)
    JUST_GUESS="true"
    GUESS="true"
    ;;
  *)
    DFX_NETWORK="$env"
    ;;
  esac
done

export DFX_NETWORK
: $DFX_NETWORK

if [[ "$GUESS" == "true" ]]; then
  case "$DFX_NETWORK" in
  local)
    START_DFX=true
    DEPLOY_NNS_BACKEND=true
    DEPLOY_II=true
    DEPLOY_NNS_DAPP=true
    OPEN_NNS_DAPP=true
    ;;
  *)
    { # Can we find an existing II?
      dfx canister --network "$DFX_NETWORK" id internet_identity ||
        jq -re '.networks[env.DFX_NETWORK].config.IDENTITY_SERVICE_URL' dfx.json ||
        jq -re '.networks[env.DFX_NETWORK].config.IDENTITY_SERVICE_ID' dfx.json
    } >/dev/null 2>/dev/null || {
      DEPLOY_II=true
    }
    DEPLOY_NNS_DAPP=true
    OPEN_NNS_DAPP=true
    ;;
  esac
fi
echo START_DFX=$START_DFX
echo DEPLOY_NNS_BACKEND=$DEPLOY_NNS_BACKEND
echo DEPLOY_II=$DEPLOY_II
echo DEPLOY_NNS_DAPP=$DEPLOY_NNS_DAPP
echo OPEN_NNS_DAPP=$OPEN_NNS_DAPP
[[ "$JUST_GUESS" != "true" ]] || exit 0

if [[ "$START_DFX" == "true" ]]; then
  dfx start --clean &
fi

if [[ "$DEPLOY_NNS_BACKEND" == "true" ]]; then
  ./e2e-tests/scripts/nns-canister-download
  ./e2e-tests/scripts/nns-canister-build
  ./e2e-tests/scripts/nns-canister-install
fi

if [[ "$DEPLOY_II" == "true" ]]; then
  dfx deploy --network "$DFX_NETWORK" internet_identity --no-wallet
  echo "Waiting for II to be stable..."
  sleep 4
fi

if [[ "$DEPLOY_NNS_DAPP" == "true" ]]; then
  # Note:  NNS dapp is the only canister provided by this repo, however dfx.json
  #        includes other canisters for testing purposes.  If testing you MAY wish
  #        to deploy these other canisters as well, but you probbaly don't.
  dfx canister --network "$DFX_NETWORK" create nns-dapp --no-wallet || echo "canister may have been created already"
  dfx deploy --network "$DFX_NETWORK" nns-dapp
  OWN_CANISTER_URL="$(jq -r .OWN_CANISTER_URL ./frontend/ts/src/config.json)"
  echo "Deployed to: $OWN_CANISTER_URL"
fi

if [[ "$OPEN_NNS_DAPP" == "true" ]]; then
  OWN_CANISTER_URL="$(jq -r .OWN_CANISTER_URL ./frontend/ts/src/config.json)"
  echo "Opening: $OWN_CANISTER_URL"
  case "$(uname)" in
  Linux) xdg-open "$OWN_CANISTER_URL" ;;
  Darwin) open "$OWN_CANISTER_URL" ;;
  *) firefox "$OWN_CANISTER_URL" ;;
  esac
fi
