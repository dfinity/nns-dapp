#!/usr/bin/env bash
set -eoo pipefail
cd "$(dirname "$0")"

OUTDIR=../../target/ledger-canister

DOCKER_BUILDKIT=1 docker build \
  --target scratch \
  -t "ledger" \
  -f ledger.Dockerfile \
  -o "$OUTDIR" .
