#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$(realpath "$0")")" || exit

help_text() {
  cat <<-"EOF"

	Deploys the nns-dapp or internet identity to a network.

	Usage:

	Preflight: Make sure that you can run build.sh before using deploy.sh.  The build
	  script requires a number of dependencies.  If you cannot run "build.sh" then
	  "dfx deploy" will fail. To check, run:  DFX_NETWORK=mainnet build.sh

	./deploy.sh --nns-dapp <network>
	  Deploys nns-dapp to the selected network. The default is "local".

The available networks are the ones listed in dfx.json.

EOF
}

#
DFX_NETWORK=local             # which network to deploy to
CONFIG_FILE="./frontend/.env" # the location of the dapp .env config, computed from dfx.json for the specific network.

# Whether to run each action:
DEPLOY_II="false"
DEPLOY_NNS_DAPP="false"

while (($# > 0)); do
  env="$1"
  shift 1
  case "$env" in
  --help)
    help_text | "${PAGER:-less}"
    exit 0
    ;;
  --ii)
    DEPLOY_II="true"
    ;;
  --nns-dapp)
    DEPLOY_NNS_DAPP="true"
    ;;
  *)
    DFX_NETWORK="$env"
    # Check that the network is valid.
    DFX_NETWORK="$env" jq -e '.networks[env.DFX_NETWORK]' dfx.json || {
      echo "ERROR: Network '$env' is not listed in dfx.json"
      exit 1
    } >&2
    ;;
  esac
done

export DFX_NETWORK

if [[ "$DEPLOY_II" == "true" ]]; then
  dfx deploy --network "$DFX_NETWORK" internet_identity --no-wallet
  echo "Waiting for II to be stable..."
  sleep 4
fi

if [[ "$DEPLOY_NNS_DAPP" == "true" ]]; then
  # Note:  NNS dapp is the only canister provided by this repo, however dfx.json
  #        includes other canisters for testing purposes.  If testing you MAY wish
  #        to deploy these other canisters as well, but you probably don't.
  ./config.sh
  dfx canister --network "$DFX_NETWORK" create nns-dapp --no-wallet || echo "canister may have been created already"
  dfx deploy nns-dapp --argument "$(cat nns-dapp-arg.did)" --upgrade-unchanged --network "$DFX_NETWORK" --no-wallet
  OWN_CANISTER_URL="$(grep OWN_CANISTER_URL <"$CONFIG_FILE" | sed "s|VITE_OWN_CANISTER_URL=||g")"
  echo "Deployed to: $OWN_CANISTER_URL"
fi
