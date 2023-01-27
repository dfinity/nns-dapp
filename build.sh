#!/usr/bin/env bash
#
# The frontend is built into public/. The dapp is bundled into a tarball,
# assets.tar.xz. This tarball is baked into the wasm binary output at build
# time by cargo, and finally the wasm binary is read by ic-cdk-optimizer and
# optimizer. This scripts outputs a single file, nns-dapp.wasm.
#
#                          frontend◄─────────── assets.tar.xz
#                                                           ▲
#                                                           │
#                                                           │
#                                                      cargo build
#                                                           ▲
#                                                           │ ic-cdk-optimizer
#                                                           │
#                                                      nns-dapp.wasm

set -euo pipefail

TOPLEVEL="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# If the WASM has been provided, there is no need to build it:
[[ "${NNS_DAPP_WASM:-}" == "" ]] || {
  test -f "${NNS_DAPP_WASM}" || {
    echo "File not found, or node is not a file: NNS_DAPP_WASM='${NNS_DAPP_WASM}'"
    exit 1
  } >&2
  INSTALL_LOCATION="$(jq -r '.canisters["nns-dapp"].wasm' dfx.json)"
  [[ "$(realpath "${NNS_DAPP_WASM}")" == "$(realpath "${INSTALL_LOCATION}")" ]] ||
    cp "${NNS_DAPP_WASM}" "${INSTALL_LOCATION}"
  echo "Skipping build as the WASM file has already been provided."
  exit 0
}

# Need to know which deployment we are building for:
DFX_NETWORK="${DFX_NETWORK:-}"
export DFX_NETWORK
jq -e '.networks[env.DFX_NETWORK]' dfx.json || {
  echo "Which deployment? Set DFX_NETWORK to one of:"
  jq -er '.networks | keys | join("  ")' dfx.json
  exit 1
} >&2

# Assemble the configuration
. config.sh
export HOST
export IDENTITY_SERVICE_URL
export OWN_CANISTER_ID
export OWN_CANISTER_URL
export FETCH_ROOT_KEY
export GOVERNANCE_CANISTER_ID
export GOVERNANCE_CANISTER_URL
export LEDGER_CANISTER_ID
export LEDGER_CANISTER_URL
export WASM_CANISTER_ID

set -x

###################
# frontend # (output: frontend/public/)
###################
"$TOPLEVEL/build-frontend.sh"

###############
# cargo build # (output: target/release/.../nns-dapp.wasm)
###############
echo Compiling rust package
cargo_args=(--target wasm32-unknown-unknown --release --package nns-dapp)
if [[ $DFX_NETWORK != "mainnet" ]]; then
  cargo_args+=(--features mock_conversion_rate)
fi

(cd "$TOPLEVEL" && cargo build "${cargo_args[@]}")

####################
# ic-cdk-optimizer # (output: nns-dapp.wasm)
####################
echo Optimising wasm
cd "$TOPLEVEL"
ic-cdk-optimizer ./target/wasm32-unknown-unknown/release/nns-dapp.wasm -o ./nns-dapp.wasm
gzip -f -n nns-dapp.wasm
mv nns-dapp.wasm.gz nns-dapp.wasm
ls -sh ./nns-dapp.wasm
sha256sum ./nns-dapp.wasm
