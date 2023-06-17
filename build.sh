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
. "$TOPLEVEL/scripts/require-dfx-network.sh"

# Can we skip this here because build-frontend.sh now does it?
# Or do we need the exports for the backend as well?

# Assemble the configuration
./config.sh

set -x

###################
# frontend # (output: assets.tar.xz)
###################
"$TOPLEVEL/build-frontend.sh"

###############
# backend # (output: nns-dapp.wasm)
###############
"$TOPLEVEL/build-backend.sh"
