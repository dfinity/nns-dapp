#!/usr/bin/env bash
set -euo pipefail

TOPLEVEL="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Defines NNS_DAPP_BUILD_FLAVOURS:
source "${TOPLEVEL}/scripts/nns-dapp/flavours.bash"

###############
# backend # (output: nns-dapp_test.wasm.gz, nns-dapp_production.wasm.gz and, for backwards compatibility, nns-dapp.wasm.gz)
###############

for DFX_FLAVOUR in "${NNS_DAPP_BUILD_FLAVOURS[@]}"; do

  echo "Compiling nns-dapp backend, $DFX_FLAVOUR build..."
  "$TOPLEVEL/build-rs.sh" nns-dapp --features "${DFX_FLAVOUR}"

  mv "nns-dapp.wasm.gz" "nns-dapp_${DFX_FLAVOUR}.wasm.gz"

  echo "Sanity checking $DFX_FLAVOUR build..."
  scripts/nns-dapp/test-exports --flavour "$DFX_FLAVOUR"
done

# For backwards compatibility:
cp nns-dapp-production.wasm.gz nns-dapp.wasm.gz
