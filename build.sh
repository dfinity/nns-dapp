#!/usr/bin/env bash
#
# The frontend/svelte is built into public/. The svelte is bundled into a tarball,
# assets.tar.xz. This tarball is baked into the wasm binary output at build
# time by cargo, and finally the wasm binary is read by ic-cdk-optimizer and
# optimizer. This scripts outputs a single file, nns-dapp.wasm.
#
#                          frontend/svelte◄─────────── assets.tar.xz
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
export REDIRECT_TO_LEGACY
export ENABLE_NEW_SPAWN_FEATURE

set -x

###################
# frontend/svelte # (output: frontend/svelte/public/)
###################
(cd "$TOPLEVEL/frontend/svelte" && npm ci && npm run build)

#################
# assets.tar.xz #
#################

# we need GNU tar (see below) so we check early
if tar --help | grep GNU >/dev/null; then
  echo "found GNU tar as tar"
  tar="tar"
elif command -v gtar >/dev/null; then
  echo "found GNU tar as gtar"
  tar="gtar"
else
  echo "did not find GNU tar, please install"
  echo "  brew install gnu-tar"
  exit 1
fi

if ! command -v xz >/dev/null; then
  echo "did not find xz, please install"
  echo "  brew install xz"
  exit 1
fi

# We use a local directory, and we don't delete it after the build, so that
# assets can be inspected.
tarball_dir="$TOPLEVEL/web-assets"
rm -rf "$tarball_dir"
echo "using $tarball_dir for tarball directory"
cp -R "$TOPLEVEL/frontend/svelte/public/" "$tarball_dir/"

# Bundle into a tight tarball
# On macOS you need to install gtar + xz
# brew install gnu-tar
# brew install xz
cd "$tarball_dir"

"$tar" cJv --mtime='2021-05-07 17:00+00' --sort=name --exclude .last_build_id -f "$TOPLEVEL/assets.tar.xz" .

cd "$TOPLEVEL"

ls -sh "$TOPLEVEL/assets.tar.xz"
sha256sum "$TOPLEVEL/assets.tar.xz"

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
ls -sh ./nns-dapp.wasm
sha256sum ./nns-dapp.wasm
