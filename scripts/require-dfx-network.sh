#!/usr/bin/env bash

# Makes sure DFX_NETWORK is set to a known value or instructs what to do.

DFX_NETWORK="${DFX_NETWORK:-}"
export DFX_NETWORK

. "$(dirname "$0")/network-config"
assert_dfx_network_var_is_configured
