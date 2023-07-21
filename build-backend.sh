#!/usr/bin/env bash
set -euo pipefail

TOPLEVEL="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

###############
# backend # (output: nns-dapp.wasm.gz)
###############
echo Compiling rust package
"$TOPLEVEL/build-rs.sh" nns-dapp --features "${DFX_FLAVOUR:-production}"

echo Sanity check
scripts/nns-dapp/test-exports
