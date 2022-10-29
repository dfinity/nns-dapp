#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$(realpath "$0")")" || exit

help_text() {
  cat <<-"EOF"

	Deploys the nns-dapp to a network or to local dfx:
	- Starts dfx (optional)
	- Installs governance canisters (optional)
	- Installs Internet Identity (optional)
	- Installs the NNS Dapp
	- Opens the NNS dapp in a browser (optional)

	On success the deployment is ready for development or testing:
	- frontend:
	    cd frontend
	    npm ci
	    npm run dev
	- testing:
	    cd e2e-tests
	    npm ci
	    npm run test

	Usage:

	Preflight: Make sure that you can run build.sh before using deploy.sh.  The build
	  script requires a number of dependencies.  If you cannot run "build.sh" then
	  "dfx deploy" will fail.  To check, run:  DFX_NETWORK=mainnet build.sh

	./deploy.sh
	  Creates a local network with the nns-dapp and supporting NNS and II canisters.
	  This is the same as: ./deploy.sh local

	./deploy.sh <network> --dry-run
	  Prints the steps that would be executed if run against the given network.

	./deploy.sh <network>
	  Deploys nns-dapp and required, apparently missing canisters to the given network.

	./deploy.sh [network] <flags>
	  Executes just the steps specified in the flags.

	Flags:
	--help
	  Print this help message and exit.

	--dry-run
	  Print the steps that seem to be necessary for deployment.

	--delete
	  Delete network entries before deploying.

	--delete-canister-ids
	  Delete canister_id.json entries for the network before deploying.

	--delete-wallet
	  Delete wallet for the network before deploying.

	--start
	  Start dfx in the background.

	--nns-backend
	  Deploy NNS backend canisters.

	--ii
	  Create the internet_identity canister.

	--sns-wasm
	  Create or update an SNS wasm canister.

	--sns
	  Create an SNS canister set.

	--nns-dapp
	  Deploy the NNS dapp.

	--populate
	  Create sample users with ICP, neurons and follow relationships.

	--open
	  Open the NNS dapp in a browser.

	--ctl-nobuild-nns
	  Use the existing NNS and SNS wasm canisters.

	EOF
}

#
GUESS="true"                  # figure out which steps to run, as opposed to just performing the requested steps.
DRY_RUN="false"               # print what would be done but don't do anything
DFX_NETWORK=local             # which network to deploy to
CONFIG_FILE="./frontend/.env" # the location of the dapp .env config, computed from dfx.json for the specific network.

# Whether to run each action:
DELETE_CANISTER_IDS="false"
DELETE_WALLET="false"
START_DFX="false"
DEPLOY_NNS_BACKEND="false"
DEPLOY_II="false"
DEPLOY_SNS="false"
DEPLOY_SNS_WASM_CANISTER=""
DEPLOY_NNS_DAPP="false"
POPULATE="false"
OPEN_NNS_DAPP="false"
CTL_NOBUILD_NNS="false"

while (($# > 0)); do
  env="$1"
  shift 1
  case "$env" in
  --help)
    help_text | "${PAGER:-less}"
    exit 0
    ;;
  --delete)
    GUESS="false"
    DELETE_CANISTER_IDS="true"
    DELETE_WALLET="true"
    ;;
  --delete-canister-ids)
    GUESS="false"
    DELETE_CANISTER_IDS="true"
    ;;
  --delete-wallet)
    GUESS="false"
    DELETE_WALLET="true"
    ;;
  --start)
    GUESS="false"
    START_DFX="true"
    ;;
  --ii)
    GUESS="false"
    DEPLOY_II="true"
    ;;
  --sns-wasm)
    GUESS="false"
    DEPLOY_SNS_WASM_CANISTER="true"
    ;;
  --sns)
    GUESS="false"
    DEPLOY_SNS="true"
    DEPLOY_SNS_WASM_CANISTER="${DEPLOY_SNS_WASM_CANISTER:-ifnotinstalled}"
    ;;
  --nns-backend)
    GUESS="false"
    DEPLOY_NNS_BACKEND="true"
    ;;
  --nns-dapp)
    GUESS="false"
    DEPLOY_NNS_DAPP="true"
    ;;
  --populate)
    GUESS="false"
    POPULATE="true"
    ;;
  --open)
    GUESS="false"
    OPEN_NNS_DAPP="true"
    ;;
  --dry-run)
    DRY_RUN="true"
    ;;
  --ctl-nobuild-nns)
    CTL_NOBUILD_NNS="true"
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

if [[ "$GUESS" == "true" ]]; then
  case "$DFX_NETWORK" in
  local)
    START_DFX=true
    DEPLOY_NNS_BACKEND=true
    DEPLOY_II=true
    DEPLOY_NNS_DAPP=true
    POPULATE=true
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
    POPULATE=true
    ;;
  esac
fi

if [[ "$DRY_RUN" == "true" ]] || [[ "$GUESS" == "true" ]]; then
  echo
  echo DELETE_CANISTER_IDS=$DELETE_CANISTER_IDS
  echo DELETE_WALLET=$DELETE_WALLET
  echo START_DFX=$START_DFX
  echo DEPLOY_NNS_BACKEND=$DEPLOY_NNS_BACKEND
  echo DEPLOY_SNS_WASM_CANISTER="${DEPLOY_SNS_WASM_CANISTER:-}"
  echo DEPLOY_II=$DEPLOY_II
  echo DEPLOY_NNS_DAPP=$DEPLOY_NNS_DAPP
  echo POPULATE=$POPULATE
  echo DEPLOY_SNS="$DEPLOY_SNS"
  echo OPEN_NNS_DAPP=$OPEN_NNS_DAPP
fi

[[ "$DRY_RUN" != "true" ]] || exit 0
[[ "$GUESS" != "true" ]] || {
  echo
  read -rp "Did I guess right? (y/N)  " guessed_right
  [[ "$guessed_right" == "y" ]] || {
    echo
    echo "Suggestions:"
    echo "Wanted DEPLOY_II=true but got false?"
    echo "- Check whether you have an old canister_ids.json that needs to be deleted."
    echo
    echo "Want to specify what you want exactly using flags?"
    echo "- Use --help to see the supported flags."
    echo
    exit 1
  }
}

if [[ "$DELETE_CANISTER_IDS" == "true" ]]; then
  if test -e canister_ids.json; then
    : Back up the canister_ids.json
    cp canister_ids.json "canister_ids.json.$(date -Isecond -u | sed 's/+.*//g')"
    echo "Deleting the entries for $DFX_NETWORK in canister_ids.json ..."
    DFX_NETWORK="$DFX_NETWORK" jq 'to_entries | map(del(.value[env.DFX_NETWORK])) | from_entries' <canister_ids.json >canister_ids.json.new
    mv canister_ids.json.new canister_ids.json
  fi
fi

if [[ "$DELETE_WALLET" == "true" ]]; then
  # Note: "list" puts a '*' printed next to the current ID, but it is on stderr
  #       so we discard it on dev/null leaving just the user's identities, one per line.
  dfx identity list 2>/dev/null |
    while read -r DFX_ID; do
      WALLET_FILE="${HOME}/.config/dfx/identity/$DFX_ID/wallets.json"
      if test -e "$WALLET_FILE"; then
        : Back up wallet
        cp "${WALLET_FILE}" "${WALLET_FILE}.$(date -Isecond -u | sed 's/+.*//g')"
        echo "Deleting the wallet for $DFX_NETWORK in $WALLET_FILE ..."
        DFX_NETWORK="$DFX_NETWORK" DFX_ID="$DFX_ID" jq 'del(.identities[env.DFX_ID][env.DFX_NETWORK])' "${WALLET_FILE}" | jq -s first >"${WALLET_FILE}.new"
        mv "${WALLET_FILE}.new" "${WALLET_FILE}"
      fi
    done
fi

if [[ "$START_DFX" == "true" ]]; then
  echo
  echo "Please run these commands in a separate terminal:"
  echo
  echo "  pkill dfx"
  echo "  dfx start --clean"
  echo
  read -rp "Please press enter when done... "
fi

: "Get WASM and did files.  By now it's needed for almost everything except open..."
if [[ "$DEPLOY_NNS_BACKEND" == "true" ]] || [[ "$DEPLOY_SNS" == "true" ]] || test -n "${DEPLOY_SNS_WASM_CANISTER:-}"; then
  if [[ "$CTL_NOBUILD_NNS" == "true" ]]; then
    echo "Using exising NNS and SNS canisters"
  else
    ./e2e-tests/scripts/nns-canister-download
    ./e2e-tests/scripts/nns-canister-build
  fi
fi

if [[ "$DEPLOY_NNS_BACKEND" == "true" ]]; then
  ./e2e-tests/scripts/nns-canister-install
fi

# Note: On mainnet SNS are created much later and have unpredictable canister IDs, however
# until an index canister exists we need the SNS to exist at a predictable address, so we install it now.
# Note: There may be multiple SNS canister sets; at present this can be done in a somewhat clunky way by
# adding numbers to SNS canister names, however in future versions of dfx, it will be possible to have
# several dfx.json, so we can have one dfx.json per SNS and one for the nns-dapp project, without weird names.
if test -n "${DEPLOY_SNS_WASM_CANISTER:-}"; then
  # If the wasm canister has not been installed already, install it.
  echo Checking whether sns wasm is installed
  SNS_WASM_CANISTER_ID="$(dfx canister --network "$DFX_NETWORK" id nns-sns-wasm 2>/dev/null || echo NOPE)"
  [[ "${SNS_WASM_CANISTER_ID:-}" == "NOPE" ]] || {
    echo "SNS wasm/management canister already installed at: $SNS_WASM_CANISTER_ID"
  }
  if [[ "${SNS_WASM_CANISTER_ID:-}" != "NOPE" ]] && [[ "$DEPLOY_SNS_WASM_CANISTER" == "ifnotinstalled" ]]; then
    echo "Using existing WASM canister..."
  else
    echo "Deploying SNS wasm canister..."
    NNS_URL="$(./e2e-tests/scripts/nns-dashboard --dfx-network "$DFX_NETWORK")"
    SNS_SUBNETS="$(ic-admin --nns-url "$NNS_URL" get-subnet-list | jq -r '. | map("principal \"" + . + "\"") | join("; ")')"
    dfx deploy --network "$DFX_NETWORK" nns-sns-wasm --argument '( record { sns_subnet_ids = vec { '"$SNS_SUBNETS"' }; access_controls_enabled = false; allowed_principals = vec {}; } )' --no-wallet
    SNS_WASM_CANISTER_ID="$(dfx canister --network "$DFX_NETWORK" id nns-sns-wasm)"
    echo "SNS wasm/management canister installed at: $SNS_WASM_CANISTER_ID"
    echo "Uploading wasms to the wasm canister"
    for canister in root governance ledger swap archive index; do
      ./target/ic/sns add-sns-wasm-for-tests \
        --network "$DFX_NETWORK" \
        --override-sns-wasm-canister-id-for-tests "${SNS_WASM_CANISTER_ID}" \
        --wasm-file "$(CANISTER="sns_$canister" jq -r '.canisters[env.CANISTER].wasm' dfx.json)" "$canister"
    done
  fi
fi

if [[ "$DEPLOY_II" == "true" ]]; then
  dfx deploy --network "$DFX_NETWORK" internet_identity --no-wallet
  echo "Waiting for II to be stable..."
  sleep 4
fi

if [[ "$DEPLOY_NNS_DAPP" == "true" ]]; then
  # Note:  NNS dapp is the only canister provided by this repo, however dfx.json
  #        includes other canisters for testing purposes.  If testing you MAY wish
  #        to deploy these other canisters as well, but you probably don't.
  dfx canister --network "$DFX_NETWORK" create nns-dapp --no-wallet || echo "canister may have been created already"
  dfx deploy --network "$DFX_NETWORK" nns-dapp --no-wallet
  OWN_CANISTER_URL="$(grep OWN_CANISTER_URL <"$CONFIG_FILE" | sed "s|VITE_OWN_CANISTER_URL=||g")"
  echo "Deployed to: $OWN_CANISTER_URL"
fi

if [[ "$POPULATE" == "true" ]]; then
  echo Setting the cycles exchange rate...
  ./scripts/propose --to propose-xdr-icp-conversion-rate --dfx-network "$DFX_NETWORK" --jfdi

  # Allow the cmc canister to create canisters anywhere.
  # Note: The proposal is accepted and executed immediately because there are no neurons apart from the test user.
  # Note: Local dfx has no subnets.
  [[ "$DFX_NETWORK" == "local" ]] || {
    echo Setting the list of subnets CMC is authorized to create canisters in...
    ./scripts/propose --to set-authorized-subnetworks --dfx-network "$DFX_NETWORK" --jfdi
  }

  # Create users and neurons
  # Note: Cannot be used with flutter.
  echo Creating users and neurons...
  pushd e2e-tests
  npm ci
  printf '%s\n' user-N01-neuron-created.e2e.ts |
    SCREENSHOT=1 xargs -I {} npm run test -- --spec "./specs/{}"
  popd
fi

if [[ "$DEPLOY_SNS" == "true" ]]; then
  echo "Checking cycle balance"
  while dfx wallet --network "$DFX_NETWORK" balance | awk '{exit $1 >= 51.00}'; do
    WALLET_CANISTER="$(dfx identity --network "$DFX_NETWORK" get-wallet)"
    echo "Please add 51T cycles to this canister: $WALLET_CANISTER"
    read -rp "Press enter when done ..."
    echo
  done

  echo "Creating SNS"
  ./target/ic/sns deploy --network "$DFX_NETWORK" --override-sns-wasm-canister-id-for-tests "${SNS_WASM_CANISTER_ID}" --init-config-file sns_init.yml >sns_creation.idl

  echo "Populate canister_ids.json"
  if test -e canister_ids.json; then
    EXISTING_CANISTER_IDS="canister_ids.$(date -Iseconds)"
    cp canister_ids.json "$EXISTING_CANISTER_IDS"
  else
    echo "{}" >canister_ids.json
  fi
  sed -n ':a;/^[(]/bb;d;ba;:b;p;n;bb' <sns_creation.idl |
    idl2json |
    jq '.canisters[] | to_entries | map({ ("sns_"+.key): {(env.DFX_NETWORK): (.value[0])} }) | add' |
    jq -s '.[1] * .[0]' - canister_ids.json >canister_ids.json.new
  mv canister_ids.json.new canister_ids.json

  # Note: This must come after the canister_ids has been updated.
  echo "SNS state after creation"
  dfx canister --network "$DFX_NETWORK" call sns_swap get_state '( record {} )'
  echo "Tell the swap canister to get tokens"
  dfx canister --network "$DFX_NETWORK" call sns_swap refresh_sns_tokens '( record {} )'
  echo "SNS swap state should now have tokens"
  dfx canister --network "$DFX_NETWORK" call sns_swap get_state '( record {} )'
fi

if [[ "$OPEN_NNS_DAPP" == "true" ]]; then
  OWN_CANISTER_URL="$(grep OWN_CANISTER_URL <"$CONFIG_FILE" | sed "s|VITE_OWN_CANISTER_URL=||g")"
  echo "Opening: $OWN_CANISTER_URL"
  case "$(uname)" in
  Linux) xdg-open "$OWN_CANISTER_URL" ;;
  Darwin) open "$OWN_CANISTER_URL" ;;
  *) firefox "$OWN_CANISTER_URL" ;;
  esac
fi
