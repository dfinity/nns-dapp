#!/usr/bin/env bash
set -euo pipefail

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
export PATH="$PWD/scripts:$PATH"

: "Scan environment:"
test -n "$DFX_NETWORK" # Will fail if not defined.
export DFX_NETWORK

ENV_FILE=${ENV_OUTPUT_FILE:-$PWD/frontend/.env}
JSON_OUT="deployment-config.json"
CANDID_ARGS_FILE="nns-dapp-arg-${DFX_NETWORK}.did"

: "Get network configuration functions"
. scripts/network-config

first_not_null() {
  for x in "$@"; do
    if [ "$x" != "null" ]; then
      echo "$x"
      return
    fi
  done
  echo "null"
}

local_deployment_data="$(
  set -euo pipefail
  : "Try to find the nns-dapp canister ID:"
  : "- may be set by dfx as an env var"
  : "- may be deployed locally"
  LOCALLY_DEPLOYED_NNS_CANISTER_ID="$(dfx canister --network "$DFX_NETWORK" id nns-dapp 2>/dev/null || true)"
  test -n "${OWN_CANISTER_ID:-}" || OWN_CANISTER_ID="$LOCALLY_DEPLOYED_NNS_CANISTER_ID"
  export OWN_CANISTER_ID
  test -n "${OWN_CANISTER_ID:-}" || unset OWN_CANISTER_ID

  : "Try to find the internet_identity URL"
  : "- may be deployed locally"
  IDENTITY_SERVICE_URL="$(dfx-canister-url --network "$DFX_NETWORK" internet_identity)"
  export IDENTITY_SERVICE_URL

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

  : "Try to find the ckETH canister IDs"
  CKETH_LEDGER_CANISTER_ID="$(dfx canister --network "$DFX_NETWORK" id cketh_ledger 2>/dev/null || true)"
  export CKETH_LEDGER_CANISTER_ID
  test -n "${CKETH_LEDGER_CANISTER_ID:-}" || unset CKETH_LEDGER_CANISTER_ID
  CKETH_INDEX_CANISTER_ID="$(dfx canister --network "$DFX_NETWORK" id cketh_index 2>/dev/null || true)"
  export CKETH_INDEX_CANISTER_ID
  test -n "${CKETH_INDEX_CANISTER_ID:-}" || unset CKETH_INDEX_CANISTER_ID

  : "Try to find the ckUSDC canister IDs"
  CKUSDC_LEDGER_CANISTER_ID="$(dfx canister --network "$DFX_NETWORK" id ckusdc_ledger 2>/dev/null || true)"
  export CKUSDC_LEDGER_CANISTER_ID
  test -n "${CKUSDC_LEDGER_CANISTER_ID:-}" || unset CKUSDC_LEDGER_CANISTER_ID
  CKUSDC_INDEX_CANISTER_ID="$(dfx canister --network "$DFX_NETWORK" id ckusdc_index 2>/dev/null || true)"
  export CKUSDC_INDEX_CANISTER_ID
  test -n "${CKUSDC_INDEX_CANISTER_ID:-}" || unset CKUSDC_INDEX_CANISTER_ID

  : "Get the governance canister ID - it should be defined"
  GOVERNANCE_CANISTER_ID="$(dfx canister --network "$DFX_NETWORK" id nns-governance)"
  export GOVERNANCE_CANISTER_ID

  : "Get the ledger canister ID -it should be defined"
  LEDGER_CANISTER_ID="$(dfx canister --network "$DFX_NETWORK" id nns-ledger)"
  export LEDGER_CANISTER_ID
  : "Try to find the NNS Index canister ID"
  INDEX_CANISTER_ID="$(dfx canister --network "$DFX_NETWORK" id nns-index 2>/dev/null || true)"
  export INDEX_CANISTER_ID

  : "Get the minter canister ID - it should be defined"
  CYCLES_MINTING_CANISTER_ID="$(dfx canister id --network "$DFX_NETWORK" nns-cycles-minting)"
  export CYCLES_MINTING_CANISTER_ID

  : "Try to find the TVL canister ID"
  TVL_CANISTER_ID="$(dfx canister --network "$DFX_NETWORK" id tvl 2>/dev/null || true)"
  if [[ -z "${TVL_CANISTER_ID:-}" ]]; then
    # The TVL is now served by the nns-dapp canister.
    # We still pass the canister ID as a separate variable to allow the app
    # subnet nns-dapp (Beta) to fetch it from the system subnet nns-dapp,
    # because the app subnet nns-dapp doesn't have permission to fetch exchange
    # rates for free.
    TVL_CANISTER_ID="${OWN_CANISTER_ID:-}"
  fi
  export TVL_CANISTER_ID

  : "Define the robots text, if any"
  if [[ "$DFX_NETWORK" == "mainnet" ]]; then
    ROBOTS=''
  else
    # shellcheck disable=SC2089 # yes, we really want the backslash
    ROBOTS='<meta name="robots" content="noindex, nofollow" />'
  fi
  # shellcheck disable=SC2090 # We still want the backslash.
  export ROBOTS

  : "Get the network domains"
  API_HOST="$(dfx-canister-url --network "$DFX_NETWORK" --type api)"
  STATIC_HOST="$(dfx-canister-url --network "$DFX_NETWORK" --type static)"
  export API_HOST STATIC_HOST

  : "Put any values we found in JSON.  Omit any that are undefined."
  jq -n '{
    OWN_CANISTER_ID: env.OWN_CANISTER_ID,
    IDENTITY_SERVICE_URL: env.IDENTITY_SERVICE_URL,
    SNS_AGGREGATOR_URL: env.SNS_AGGREGATOR_URL,
    LEDGER_CANISTER_ID: env.LEDGER_CANISTER_ID,
    INDEX_CANISTER_ID: env.INDEX_CANISTER_ID,
    CKBTC_LEDGER_CANISTER_ID: env.CKBTC_LEDGER_CANISTER_ID,
    CKBTC_MINTER_CANISTER_ID: env.CKBTC_MINTER_CANISTER_ID,
    CKBTC_INDEX_CANISTER_ID: env.CKBTC_INDEX_CANISTER_ID,
    CKETH_LEDGER_CANISTER_ID: env.CKETH_LEDGER_CANISTER_ID,
    CKETH_INDEX_CANISTER_ID: env.CKETH_INDEX_CANISTER_ID,
    CKUSDC_LEDGER_CANISTER_ID: env.CKUSDC_LEDGER_CANISTER_ID,
    CKUSDC_INDEX_CANISTER_ID: env.CKUSDC_INDEX_CANISTER_ID,
    CYCLES_MINTING_CANISTER_ID: env.CYCLES_MINTING_CANISTER_ID,
    ROBOTS: env.ROBOTS,
    STATIC_HOST: env.STATIC_HOST,
    API_HOST: env.API_HOST,
    WASM_CANISTER_ID: env.WASM_CANISTER_ID,
    TVL_CANISTER_ID: env.TVL_CANISTER_ID,
    GOVERNANCE_CANISTER_ID: env.GOVERNANCE_CANISTER_ID
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
# TODO: I believe that the following can be discarded now.
json=$(HOST=$(dfx-canister-url --network "$DFX_NETWORK" --type api) jq -s --sort-keys '
  (.[0].defaults.network.config // {}) * (.[1].config // {}) * .[2] |
  .DFX_NETWORK = env.DFX_NETWORK |
  . as $config |
  .HOST=env.HOST
    ' dfx.json <(network_config) <(echo "$local_deployment_data"))

dfxNetwork=$(echo "$json" | jq -r ".DFX_NETWORK")
cmcCanisterId=$(echo "$json" | jq -r ".CYCLES_MINTING_CANISTER_ID")
wasmCanisterId=$(echo "$json" | jq -r ".WASM_CANISTER_ID")
governanceCanisterId=$(echo "$json" | jq -r ".GOVERNANCE_CANISTER_ID")
tvlCanisterId=$(echo "$json" | jq -r ".TVL_CANISTER_ID")
ledgerCanisterId=$(echo "$json" | jq -r ".LEDGER_CANISTER_ID")
indexCanisterId=$(echo "$json" | jq -r ".INDEX_CANISTER_ID")
ownCanisterId=$(echo "$json" | jq -r ".OWN_CANISTER_ID")
fetchRootKey=$(echo "$json" | jq -r ".FETCH_ROOT_KEY")
featureFlags=$(echo "$json" | jq -r ".FEATURE_FLAGS" | jq tostring)
host=$(echo "$json" | jq -r ".HOST")
identityServiceUrl=$(echo "$json" | jq -r ".IDENTITY_SERVICE_URL")
aggregatorCanisterUrl=$(echo "$json" | jq -r '.SNS_AGGREGATOR_URL // ""')
ckbtcLedgerCanisterId=$(echo "$json" | jq -r '.CKBTC_LEDGER_CANISTER_ID // ""')
ckbtcMinterCanisterId=$(echo "$json" | jq -r '.CKBTC_MINTER_CANISTER_ID // ""')
ckbtcIndexCanisterId=$(echo "$json" | jq -r '.CKBTC_INDEX_CANISTER_ID // ""')
ckethLedgerCanisterId=$(echo "$json" | jq -r '.CKETH_LEDGER_CANISTER_ID // ""')
ckethIndexCanisterId=$(echo "$json" | jq -r '.CKETH_INDEX_CANISTER_ID // ""')
ckusdcLedgerCanisterId=$(echo "$json" | jq -r '.CKUSDC_LEDGER_CANISTER_ID // ""')
ckusdcIndexCanisterId=$(echo "$json" | jq -r '.CKUSDC_INDEX_CANISTER_ID // ""')

echo "VITE_DFX_NETWORK=$dfxNetwork
VITE_CYCLES_MINTING_CANISTER_ID=$cmcCanisterId
VITE_WASM_CANISTER_ID=$wasmCanisterId
VITE_GOVERNANCE_CANISTER_ID=$governanceCanisterId
VITE_TVL_CANISTER_ID=$tvlCanisterId
VITE_LEDGER_CANISTER_ID=$ledgerCanisterId
VITE_INDEX_CANISTER_ID=$indexCanisterId
VITE_OWN_CANISTER_ID=$ownCanisterId
VITE_FETCH_ROOT_KEY=$fetchRootKey
VITE_FEATURE_FLAGS=$featureFlags
VITE_HOST=$host
VITE_IDENTITY_SERVICE_URL=$identityServiceUrl
VITE_AGGREGATOR_CANISTER_URL=${aggregatorCanisterUrl:-}
VITE_CKBTC_LEDGER_CANISTER_ID=${ckbtcLedgerCanisterId:-}
VITE_CKBTC_MINTER_CANISTER_ID=${ckbtcMinterCanisterId:-}
VITE_CKBTC_INDEX_CANISTER_ID=${ckbtcIndexCanisterId:-}
VITE_CKETH_LEDGER_CANISTER_ID=${ckethLedgerCanisterId:-}
VITE_CKETH_INDEX_CANISTER_ID=${ckethIndexCanisterId:-}
VITE_CKUSDC_LEDGER_CANISTER_ID=${ckusdcLedgerCanisterId:-}
VITE_CKUSDC_INDEX_CANISTER_ID=${ckusdcIndexCanisterId:-}" | tee "$ENV_FILE"

echo "$json" >"$JSON_OUT"
{
  echo "Config is available as JSON in '${JSON_OUT}'"
  echo "Frontend config has been defined in '${ENV_FILE}'"
} >&2

# Creates the candid arguments passed when the canister is installed.
#
# Note: If you change the schema, please consider also updating the `SchemaLabel` default in the Rust code.
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

CKETH_LEDGER_CANISTER_ID="${ckethLedgerCanisterId:-}"
export CKETH_LEDGER_CANISTER_ID
CKETH_INDEX_CANISTER_ID="${ckethIndexCanisterId:-}"
export CKETH_INDEX_CANISTER_ID

CKUSDC_LEDGER_CANISTER_ID="${ckusdcLedgerCanisterId:-}"
export CKUSDC_LEDGER_CANISTER_ID
CKUSDC_INDEX_CANISTER_ID="${ckusdcIndexCanisterId:-}"
export CKUSDC_INDEX_CANISTER_ID

GOVERNANCE_CANISTER_ID="$governanceCanisterId"
export GOVERNANCE_CANISTER_ID

TVL_CANISTER_ID="$tvlCanisterId"
export TVL_CANISTER_ID

LEDGER_CANISTER_ID="$ledgerCanisterId"
export LEDGER_CANISTER_ID
INDEX_CANISTER_ID="$indexCanisterId"
export INDEX_CANISTER_ID

OWN_CANISTER_ID="$ownCanisterId"
export OWN_CANISTER_ID

HOST="$host"
export HOST

FETCH_ROOT_KEY="$fetchRootKey"
export FETCH_ROOT_KEY

WASM_CANISTER_ID="$wasmCanisterId"
export WASM_CANISTER_ID

: "Return to the original working directory."
popd
echo FIN >&2
