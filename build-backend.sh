#!/usr/bin/env bash
set -euo pipefail

TOPLEVEL="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

###############
# backend # (output: nns-dapp.wasm)
###############
echo Compiling rust package
if [[ $DFX_NETWORK != "mainnet" ]]; then
  "$TOPLEVEL/build-rs.sh" nns-dapp --features mock_conversion_rate
else
  "$TOPLEVEL/build-rs.sh" nns-dapp
fi
