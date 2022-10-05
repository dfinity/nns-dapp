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
ENV_FILE="$PWD/frontend/.env"

: "Scan environment:"
test -n "$DFX_NETWORK" # Will fail if not defined.
export DFX_NETWORK

local_deployment_data="$(
  set -euo pipefail
  : "Try to find the nns-dapp canister ID:"
  : "- may be set by dfx as an env var"
  : "- may be deployed locally"
  LOCALLY_DEPLOYED_NNS_CANISTER_ID="$(dfx canister --network "$DFX_NETWORK" id nns-dapp 2>/dev/null || true)"
  test -n "${CANISTER_ID:-}" || CANISTER_ID="$LOCALLY_DEPLOYED_NNS_CANISTER_ID"
  export CANISTER_ID
  test -n "${CANISTER_ID:-}" || unset CANISTER_ID

  : "Try to find the internet_identity URL"
  : "- may be deployed locally"
  IDENTITY_SERVICE_URL="$(
    set -euo pipefail
    id="$(dfx canister --network "$DFX_NETWORK" id internet_identity 2>/dev/null || true)"
    : "If we have a canister ID, insert it into HOST as a subdomain."
    test -z "${id:-}" || { jq -re '.networks[env.DFX_NETWORK].config.HOST' dfx.json | sed -E "s,^(https?://)?,&${id}.,g"; }
  )"
  export IDENTITY_SERVICE_URL
  test -n "${IDENTITY_SERVICE_URL:-}" || unset IDENTITY_SERVICE_URL

  : "Get the SNS wasm canister ID, if it exists"
  : "- may be set as an env var"
  : "Note: If you want to use a wasm canister deployed by someone else, add the canister ID to the remote section in dfx.json:"
  : "      dfx.json -> canisters -> nns-sns-wasm -> remote -> id -> your DFX_NETWORK -> THE_WASM_CANISTER_ID"
  LOCALLY_DEPLOYED_WASM_CANISTER_ID="$(dfx canister --network "$DFX_NETWORK" id nns-sns-wasm 2>/dev/null || echo "NO_SNS_WASM_CANISTER_SPECIFIED")"
  test -n "${WASM_CANISTER_ID:-}" || WASM_CANISTER_ID="$LOCALLY_DEPLOYED_WASM_CANISTER_ID"
  export WASM_CANISTER_ID

  : "Get the governance canister ID - it should be defined"
  GOVERNANCE_CANISTER_ID="$(dfx canister --network "$DFX_NETWORK" id nns-governance)"
  export GOVERNANCE_CANISTER_ID

  : "Put any values we found in JSON.  Omit any that are undefined."
  jq -n '{
    OWN_CANISTER_ID: env.CANISTER_ID,
    IDENTITY_SERVICE_URL: env.IDENTITY_SERVICE_URL,
    WASM_CANISTER_ID: env.WASM_CANISTER_ID,
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
json=$(jq -s --sort-keys '
  (.[0].defaults.network.config // {}) * .[1] * .[0].networks[env.DFX_NETWORK].config |
  .DFX_NETWORK = env.DFX_NETWORK |
  . as $config |
  .GOVERNANCE_CANISTER_URL=( if (.GOVERNANCE_CANISTER_URL == null) then (.HOST | sub("^(?<p>https?://)";"\(.p)\($config.GOVERNANCE_CANISTER_ID).")) else .GOVERNANCE_CANISTER_URL end ) |
  .LEDGER_CANISTER_URL=( if (.LEDGER_CANISTER_URL == null) then (.HOST | sub("^(?<p>https?://)";"\(.p)\($config.LEDGER_CANISTER_ID).")) else .LEDGER_CANISTER_URL end ) |
  .OWN_CANISTER_URL=( if (.OWN_CANISTER_URL == null) then (.HOST | sub("^(?<p>https?://)";"\(.p)\($config.OWN_CANISTER_ID).")) else .OWN_CANISTER_URL end ) |
  .OWN_CANISTER_URL=(.OWN_CANISTER_URL | sub("OWN_CANISTER_ID"; $config.OWN_CANISTER_ID))
' dfx.json <(echo "$local_deployment_data"))

dfxNetwork=$(echo "$json" | jq -r ".DFX_NETWORK")
cmcCanisterId=$(echo "$json" | jq -r ".CYCLES_MINTING_CANISTER_ID")
wasmCanisterId=$(echo "$json" | jq -r ".WASM_CANISTER_ID")
governanceCanisterId=$(echo "$json" | jq -r ".GOVERNANCE_CANISTER_ID")
governanceCanisterUrl=$(echo "$json" | jq -r ".GOVERNANCE_CANISTER_URL")
ledgerCanisterId=$(echo "$json" | jq -r ".LEDGER_CANISTER_ID")
ledgerCanisterUrl=$(echo "$json" | jq -r ".LEDGER_CANISTER_URL")
ownCanisterId=$(echo "$json" | jq -r ".OWN_CANISTER_ID")
ownCanisterUrl=$(echo "$json" | jq -r ".OWN_CANISTER_URL")
fetchRootKey=$(echo "$json" | jq -r ".FETCH_ROOT_KEY")
featureFlags=$(echo "$json" | jq -r ".FEATURE_FLAGS" | jq tostring)
host=$(echo "$json" | jq -r ".HOST")
identityServiceUrl=$(echo "$json" | jq -r ".IDENTITY_SERVICE_URL")

echo "VITE_DFX_NETWORK=$dfxNetwork
VITE_CYCLES_MINTING_CANISTER_ID=$cmcCanisterId
VITE_WASM_CANISTER_ID=$wasmCanisterId
VITE_GOVERNANCE_CANISTER_ID=$governanceCanisterId
VITE_GOVERNANCE_CANISTER_URL=$governanceCanisterUrl
VITE_LEDGER_CANISTER_ID=$ledgerCanisterId
VITE_LEDGER_CANISTER_URL=$ledgerCanisterUrl
VITE_OWN_CANISTER_ID=$ownCanisterId
VITE_OWN_CANISTER_URL=$ownCanisterUrl
VITE_FETCH_ROOT_KEY=$fetchRootKey
VITE_FEATURE_FLAGS=$featureFlags
VITE_HOST=$host
VITE_IDENTITY_SERVICE_URL=$identityServiceUrl" | tee "$ENV_FILE"

echo "Config has been defined in '${ENV_FILE}'" >&2

IDENTITY_SERVICE_URL="$identityServiceUrl"
export IDENTITY_SERVICE_URL

GOVERNANCE_CANISTER_ID="$governanceCanisterId"
export GOVERNANCE_CANISTER_ID
GOVERNANCE_CANISTER_URL="$governanceCanisterUrl"
export GOVERNANCE_CANISTER_URL

LEDGER_CANISTER_ID="$ledgerCanisterId"
export LEDGER_CANISTER_ID
LEDGER_CANISTER_URL="$ledgerCanisterUrl"
export LEDGER_CANISTER_URL

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
