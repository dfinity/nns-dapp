#!/usr/bin/env bash
set -ueo pipefail

NNS_DAPP_DIR="$(realpath "$1")"
NNS_DAPP_SUBDIR=rs/nns-dapp.did
NNS_DAPP_COMMIT="$(cd "${NNS_DAPP_DIR}" && git rev-parse HEAD)"

cd "$(dirname "$(realpath "$0")")/.."

{
  echo "// Generated from nns-dapp repo commit ${NNS_DAPP_COMMIT} by $(basename "${0}")"
  cat "$NNS_DAPP_DIR/$NNS_DAPP_SUBDIR"
} >src/lib/canisters/nns-dapp/nns_dapp.did
