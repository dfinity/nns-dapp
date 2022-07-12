#!/usr/bin/env bash
# Prints build configuration as KEY=VALUE lines, suitable for bash and github actions.
set -euxo pipefail
cd "$(dirname "$(realpath "$0")")"
jq -r '.defaults.build.config | to_entries | .[] | .key+"="+(.value|tostring)' dfx.json
jq -r '"DFX_VERSION="+.dfx' dfx.json
