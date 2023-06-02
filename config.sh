#!/usr/bin/env bash
set -euo pipefail
SOURCE_DIR="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
PATH="$SOURCE_DIR/scripts:$PATH"

##################################################
# SINGLE SOURCE OF TRUTH FOR BUILD CONFIGURATION #
##################################################

# Usage:
# - In bash scripts, source this file.
# - In javascript, load config.json, located in the repo root directory and created by running this script.
#
# To define a constant:
# - Add it to dfx.json
#   - either under defaults.networks.config.SOMEVAR=SOMEVAL
#   - or under networks.SOME_NETWORK.config.SOMEVAR=SOMEVAL
# - Verify that the constant appears in config.json if you run this script.
# - Add an export clause to the bottom of this file, if you will need the constant in bash.
#

: "Move into the repository root directory"
pushd "$(dirname "${BASH_SOURCE[0]}")"

: "Scan environment:"
test -n "$DFX_NETWORK" # Will fail if not defined.
export DFX_NETWORK

ENV_FILE=${ENV_OUTPUT_FILE:-$PWD/frontend/.env}
JSON_OUT="deployment-config.json"
CANDID_ARGS_FILE="nns-dapp-arg-${DFX_NETWORK}.did"

local_deployment_data="$(
  set -euo pipefail
  : "Try to find the nns-dapp canister ID:"
  : "- may be set by dfx as an env var"
  : "- may be deployed locally"
  LOCALLY_DEPLOYED_NNS_CANISTER_ID="$(dfx canister --network "$DFX_NETWORK" id nns-dapp 2>/dev/null || true)"
  test -n "${CANISTER_ID:-}" || CANISTER_ID="$LOCALLY_DEPLOYED_NNS_CANISTER_ID"
  export CANISTER_ID
  test -n "${CANISTER_ID:-}" || unset CANISTER_ID

  : "Get the own canister URL"
  OWN_CANISTER_URL="$(dfx-canister-url --network "$DFX_NETWORK" nns-dapp)"
  export OWN_CANISTER_URL
  test -n "$OWN_CANISTER_URL" || {
    echo "ERROR: Unable to depermine OWN_CANISTER_URL"
    exit 1
  } >&2

  : "Try to find the internet_identity URL"
  : "- may be deployed locally"
  IDENTITY_SERVICE_URL="$(dfx-canister-url --network "$DFX_NETWORK" internet_identity)"
  export IDENTITY_SERVICE_URL
  test -n "${IDENTITY_SERVICE_URL:-}" || {
    echo "ERROR: Unable to deterine internet_identity URL"
    exit 1
  } >&2

  : "Get the SNS wasm canister ID, if it exists"
  : "- may be set as an env var"
  : "Note: If you want to use a wasm canister deployed by someone else, add the canister ID to the remote section in dfx.json:"
  : "      dfx.json -> canisters -> nns-sns-wasm -> remote -> id -> your DFX_NETWORK -> THE_WASM_CANISTER_ID"
  LOCALLY_DEPLOYED_WASM_CANISTER_ID="$(dfx canister --network "$DFX_NETWORK" id nns-sns-wasm 2>/dev/null || echo "NO_SNS_WASM_CANISTER_SPECIFIED")"
  test -n "${WASM_CANISTER_ID:-}" || WASM_CANISTER_ID="$LOCALLY_DEPLOYED_WASM_CANISTER_ID"
  export WASM_CANISTER_ID

  : "Try to find the SNS aggregator URL"
  : "- may be deployed locally"
  SNS_AGGREGATOR_URL="$(dfx-canister-url --network "$DFX_NETWORK" sns_aggregator)"
  export SNS_AGGREGATOR_URL

  : "Try to find the ckBTC canister IDs"
  CKBTC_LEDGER_CANISTER_ID="$(dfx canister --network "$DFX_NETWORK" id ckbtc_ledger 2>/dev/null || true)"
  export CKBTC_LEDGER_CANISTER_ID
  test -n "${CKBTC_LEDGER_CANISTER_ID:-}" || unset CKBTC_LEDGER_CANISTER_ID
  CKBTC_INDEX_CANISTER_ID="$(dfx canister --network "$DFX_NETWORK" id ckbtc_index 2>/dev/null || true)"
  export CKBTC_INDEX_CANISTER_ID
  test -n "${CKBTC_INDEX_CANISTER_ID:-}" || unset CKBTC_INDEX_CANISTER_ID
  CKBTC_MINTER_CANISTER_ID="$(dfx canister --network "$DFX_NETWORK" id ckbtc_minter 2>/dev/null || true)"
  export CKBTC_MINTER_CANISTER_ID
  test -n "${CKBTC_MINTER_CANISTER_ID:-}" || unset CKBTC_MINTER_CANISTER_ID

  : "Get the governance canister ID and URL - they should be defined"
  GOVERNANCE_CANISTER_ID="$(dfx canister --network "$DFX_NETWORK" id nns-governance)"
  export GOVERNANCE_CANISTER_ID

  : "Get the ledger canister ID and URL - they should be defined"
  LEDGER_CANISTER_ID="$(dfx canister --network "$DFX_NETWORK" id nns-ledger)"
  export LEDGER_CANISTER_ID
  LEDGER_CANISTER_URL="$(dfx-canister-url --network "$DFX_NETWORK" nns-ledger)"
  export LEDGER_CANISTER_URL

  : "Get the minter canister ID - it should be defined"
  CYCLES_MINTING_CANISTER_ID="$(dfx canister id --network "$DFX_NETWORK" nns-cycles-minting)"
  export CYCLES_MINTING_CANISTER_ID

  : "Try to find the TVL canister ID"
  TVL_CANISTER_ID="$(dfx canister --network "$DFX_NETWORK" id tvl 2>/dev/null || true)"
  export TVL_CANISTER_ID

  : "Define the robots text, if any"
  if [[ "$DFX_NETWORK" == "local" ]] || [[ "$DFX_NETWORK" == "testnet" ]]; then
    ROBOTS=''
  else
    # shellcheck disable=SC2089 # yes, we really want the backslash
    ROBOTS='<meta name="robots" content="noindex, nofollow" />'
  fi
  # shellcheck disable=SC2090 # We still want the backslash.
  export ROBOTS

  : "Define the API host"
  # TODO: When getting an API url, the canister should probably be optional.
  # TODO: A canister custom URL should probably not override the API URL.
  API_HOST="$(dfx-canister-url --network "${DFX_NETWORK/mainnet/ic}" --type api nns-governance)"
  export API_HOST

  : "Put any values we found in JSON.  Omit any that are undefined."
  jq -n '{
    OWN_CANISTER_ID: env.CANISTER_ID,
    OWN_CANISTER_URL: env.OWN_CANISTER_URL,
    IDENTITY_SERVICE_URL: env.IDENTITY_SERVICE_URL,
    SNS_AGGREGATOR_URL: env.SNS_AGGREGATOR_URL,
    CKBTC_LEDGER_CANISTER_ID: env.CKBTC_LEDGER_CANISTER_ID,
    CKBTC_MINTER_CANISTER_ID: env.CKBTC_MINTER_CANISTER_ID,
    CKBTC_INDEX_CANISTER_ID: env.CKBTC_INDEX_CANISTER_ID,
    ROBOTS: env.ROBOTS,
    WASM_CANISTER_ID: env.WASM_CANISTER_ID,
    TVL_CANISTER_ID: env.TVL_CANISTER_ID,
    GOVERNANCE_CANISTER_ID: env.GOVERNANCE_CANISTER_ID,
    HOST: env.API_HOST,
    LEDGER_CANISTER_ID: env.LEDGER_CANISTER_ID,
    LEDGER_CANISTER_URL: env.LEDGER_CANISTER_URL,
    CYCLES_MINTING_CANISTER_ID: env.CYCLES_MINTING_CANISTER_ID
    } | del(..|select(. == null))'
)"

: "Put all configuration in JSON."
: "In case of conflict:"
: "- The dfx.json networks section has the highest priority,"
: "- next, look at the environment,"
: "- last is the defaults section in dfx.json"
: ""
: "After assembling the configuration:"
: "- replace OWN_CANISTER_ID"
: "- construct ledger and governance canister URLs"
json=$(jq -s --sort-keys '
  (.[0].defaults.network.config // {}) * .[1] * .[0].networks[env.DFX_NETWORK].config |
  .DFX_NETWORK = env.DFX_NETWORK
' dfx.json <(echo "$local_deployment_data"))

dfxNetwork=$(echo "$json" | jq -r ".DFX_NETWORK")
cmcCanisterId=$(echo "$json" | jq -r ".CYCLES_MINTING_CANISTER_ID")
wasmCanisterId=$(echo "$json" | jq -r ".WASM_CANISTER_ID")
governanceCanisterId=$(echo "$json" | jq -r ".GOVERNANCE_CANISTER_ID")
tvlCanisterId=$(echo "$json" | jq -r ".TVL_CANISTER_ID")
ledgerCanisterId=$(echo "$json" | jq -r ".LEDGER_CANISTER_ID")
ownCanisterId=$(echo "$json" | jq -r ".OWN_CANISTER_ID")
ownCanisterUrl=$(echo "$json" | jq -r ".OWN_CANISTER_URL")
fetchRootKey=$(echo "$json" | jq -r ".FETCH_ROOT_KEY")
featureFlags=$(echo "$json" | jq -r ".FEATURE_FLAGS" | jq tostring)
host=$(echo "$json" | jq -r ".HOST")
identityServiceUrl=$(echo "$json" | jq -r ".IDENTITY_SERVICE_URL")
aggregatorCanisterUrl=$(echo "$json" | jq -r '.SNS_AGGREGATOR_URL // ""')
ckbtcLedgerCanisterId=$(echo "$json" | jq -r '.CKBTC_LEDGER_CANISTER_ID // ""')
ckbtcMinterCanisterId=$(echo "$json" | jq -r '.CKBTC_MINTER_CANISTER_ID // ""')
ckbtcIndexCanisterId=$(echo "$json" | jq -r '.CKBTC_INDEX_CANISTER_ID // ""')

echo "VITE_DFX_NETWORK=$dfxNetwork
VITE_CYCLES_MINTING_CANISTER_ID=$cmcCanisterId
VITE_WASM_CANISTER_ID=$wasmCanisterId
VITE_GOVERNANCE_CANISTER_ID=$governanceCanisterId
VITE_TVL_CANISTER_ID=$tvlCanisterId
VITE_LEDGER_CANISTER_ID=$ledgerCanisterId
VITE_OWN_CANISTER_ID=$ownCanisterId
VITE_OWN_CANISTER_URL=$ownCanisterUrl
VITE_FETCH_ROOT_KEY=$fetchRootKey
VITE_FEATURE_FLAGS=$featureFlags
VITE_HOST=$host
VITE_IDENTITY_SERVICE_URL=$identityServiceUrl
VITE_AGGREGATOR_CANISTER_URL=${aggregatorCanisterUrl:-}
VITE_CKBTC_LEDGER_CANISTER_ID=${ckbtcLedgerCanisterId:-}
VITE_CKBTC_MINTER_CANISTER_ID=${ckbtcMinterCanisterId:-}
VITE_CKBTC_INDEX_CANISTER_ID=${ckbtcIndexCanisterId:-}" | tee "$ENV_FILE"

echo "$json" >"$JSON_OUT"
{
  echo "Config is available as JSON in '${JSON_OUT}'"
  echo "Frontend config has been defined in '${ENV_FILE}'"
} >&2

# Creates the candid arguments passed when the canister is installed.
cat <<EOF >"$CANDID_ARGS_FILE"
(opt record{
  args = vec {
$(jq -r 'to_entries | .[] | "    record{ 0=\(.key | tojson); 1=\(.value | tostring | tojson) };"' "$JSON_OUT")
  };
})
EOF

IDENTITY_SERVICE_URL="$identityServiceUrl"
export IDENTITY_SERVICE_URL

SNS_AGGREGATOR_URL="${aggregatorCanisterUrl:-}"
export SNS_AGGREGATOR_URL

CKBTC_LEDGER_CANISTER_ID="${ckbtcLedgerCanisterId:-}"
export CKBTC_LEDGER_CANISTER_ID
CKBTC_MINTER_CANISTER_ID="${ckbtcMinterCanisterId:-}"
export CKBTC_MINTER_CANISTER_ID
CKBTC_INDEX_CANISTER_ID="${ckbtcIndexCanisterId:-}"
export CKBTC_INDEX_CANISTER_ID

GOVERNANCE_CANISTER_ID="$governanceCanisterId"
export GOVERNANCE_CANISTER_ID

TVL_CANISTER_ID="$tvlCanisterId"
export TVL_CANISTER_ID

LEDGER_CANISTER_ID="$ledgerCanisterId"
export LEDGER_CANISTER_ID

OWN_CANISTER_ID="$ownCanisterId"
export OWN_CANISTER_ID
OWN_CANISTER_URL="$ownCanisterUrl"
export OWN_CANISTER_URL

HOST="$host"
export HOST

FETCH_ROOT_KEY="$fetchRootKey"
export FETCH_ROOT_KEY

WASM_CANISTER_ID="$wasmCanisterId"
export WASM_CANISTER_ID

: "Return to the original working directory."
popd
echo FIN >&2
