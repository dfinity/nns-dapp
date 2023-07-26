#!/usr/bin/env bash
set -euo pipefail

export PATH="$PWD/scripts:$PATH"

cd "$(dirname "$(realpath "$0")")" || exit

help_text() {
  cat <<-"EOF"

	Deploys the nns-dapp or internet identity to a network.

	This file will recreate the arguments file and override it.

	If you want to use a custom arguments file, use dfx directly.

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
DFX_NETWORK=local # which network to deploy to

# Whether to run each action:
DEPLOY_II="false"
DEPLOY_NNS_DAPP="false"
DEPLOY_SNS_AGGREGATOR="false"

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
  --sns-aggregator)
    DEPLOY_SNS_AGGREGATOR="true"
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

# Reference: `./config.sh`
# TODO: Do we want to share this with `config.sh`?
first_not_null() {
  for x in "$@"; do
    if [ "$x" != "null" ]; then
      echo "$x"
      return
    fi
  done
  echo "null"
}

static_host() {
  jq -re '.networks[env.DFX_NETWORK].config | .STATIC_HOST // .HOST' dfx.json
}

canister_static_url_from_id() {
  : "If we have a canister ID, insert it into HOST as a subdomain."
  test -z "${1:-}" || { static_host | sed -E "s,^(https?://)?,&${1}.,g"; }
}

if [[ "$DEPLOY_SNS_AGGREGATOR" == "true" ]]; then
  dfx canister --network "$DFX_NETWORK" create sns_aggregator --no-wallet || echo "canister for SNS Aggregator may have been created already"
  dfx deploy --network "$DFX_NETWORK" sns_aggregator --no-wallet --upgrade-unchanged --argument '(opt record { update_interval_ms = 1000; fast_interval_ms = 1_000_000_000; })'
  SNS_AGGREGATOR_CANISTER_ID="$(dfx canister --network "$DFX_NETWORK" id sns_aggregator 2>/dev/null || true)"
  SNS_AGGREGATOR_CANISTER_URL="$(canister_static_url_from_id "$SNS_AGGREGATOR_CANISTER_ID")"
  echo "SNS Aggregator deployed to: $SNS_AGGREGATOR_CANISTER_URL"
fi

if [[ "$DEPLOY_NNS_DAPP" == "true" ]]; then
  # Note:  NNS dapp is the only canister provided by this repo, however dfx.json
  #        includes other canisters for testing purposes.  If testing you MAY wish
  #        to deploy these other canisters as well, but you probably don't.
  DFX_NETWORK="$DFX_NETWORK" ./config.sh
  dfx canister --network "$DFX_NETWORK" create nns-dapp --no-wallet || echo "canister for NNS Dapp may have been created already"
  dfx deploy nns-dapp --argument "$(cat "nns-dapp-arg-${DFX_NETWORK}.did")" --upgrade-unchanged --network "$DFX_NETWORK" --no-wallet
  echo "NNS Dapp deployed to: $(dfx-canister-url --network "$DFX_NETWORK" nns-dapp)"
fi
