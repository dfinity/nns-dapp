#!/usr/bin/env bash

# Makes sure DFX_NETWORK is set to a known value or instructs what to do.

DFX_NETWORK="${DFX_NETWORK:-}"
export DFX_NETWORK
jq -e '.networks[env.DFX_NETWORK]' dfx.json || {
  echo "Which deployment? Set DFX_NETWORK to one of:"
  jq -er '.networks | keys | join("  ")' dfx.json
  exit 1
} >&2
