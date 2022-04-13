#!/usr/bin/env bash
set -euo pipefail

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
	    test -z "$id" || { jq -re '.networks[env.DFX_NETWORK].config.HOST' dfx.json | sed -E "s,(https?://)?,&${id}.,g" ; }
	)"
	export IDENTITY_SERVICE_URL
	test -n "${IDENTITY_SERVICE_URL:-}" || unset IDENTITY_SERVICE_URL

        : "Put any values we found in JSON.  Omit any that are undefined."
	jq -n '{ OWN_CANISTER_ID: env.CANISTER_ID, IDENTITY_SERVICE_URL: env.IDENTITY_SERVICE_URL } | del(..|select(. == null))'
)"


: "Put all configuration in JSON."
: "In case of conflict:"
: "- The dfx.json networks section has the highest priority,"
: "- next, look at the environment,"
: "- last is the defaults section in dfx.json"
JSON_CONFIG_FILE="frontend/ts/src/config.json"
jq -s '(.[0].defaults.network.config // {}) * .[1] * .[0].networks[env.DFX_NETWORK].config' dfx.json <(echo "$local_deployment_data") | tee "$JSON_CONFIG_FILE"
echo "Config has been defined.  Let it never be changed." >&2

: "Export values used by bash:"
get_var() {
    var_name="$1" jq -r '.[env.var_name] | if (. == null) or (. == "") then "ERROR: Undefined config item: \(env.var_name)\n" | halt_error(1) else . end' "$JSON_CONFIG_FILE"
}

IDENTITY_SERVICE_URL="$(get_var IDENTITY_SERVICE_URL)"
export IDENTITY_SERVICE_URL

OWN_CANISTER_ID="$(get_var OWN_CANISTER_ID)"
export OWN_CANISTER_ID

# Mainnet has an undefined HOST.  The HOST is an identifier for the calling page.
HOST="$(get_var HOST 2>/dev/null || echo "")"
export HOST

FETCH_ROOT_KEY="$(get_var FETCH_ROOT_KEY)"
export FETCH_ROOT_KEY

echo FIN >&2
