#!/usr/bin/env bash

# Combine all the required steps and checks to develop against a testnet.
# If npm dependencies and canister ids didn't change, it is faster to run
# `npm run dev` from frontend/ but this script can be helpful to make sure
# you don't forget anything.

set -euo pipefail

top_dir=$(git rev-parse --show-toplevel)
ids_file="$top_dir/canister_ids.json"

cd "$top_dir"

if ! [ -f "$ids_file" ]; then
  echo "You need a 'canister_ids.json' file in $top_dir."
  echo "Ask a team member to send you theirs."
  exit 1
fi

bash_version=$(/usr/bin/env bash -c "echo \${BASH_VERSION}")
bash_major_version=$(/usr/bin/env bash -c "echo \${BASH_VERSINFO[0]}")

if [ "$bash_major_version" -lt "4" ]; then
  echo "Your bash version is very old. (${bash_version})"
  echo "Install a newer version of bash."
  exit 1
fi

need() {
  tool="$1"
  if ! command -v "$tool" >/dev/null; then
    echo "You need $tool."
    echo "Either it's not installed or it's not in your path."
    echo "You can run ./scripts/setup to install necessary tools including $tool."
    exit 1
  fi
}

need dfx
need jq
need npm
need node

networks=$(jq -r '[.[]|keys[]]|unique|join(" ")' canister_ids.json)

usage() {
  echo "Usage: $0 <network>"
  echo "Available networks are: $networks"
}

if [ "$#" != "1" ]; then
  usage
  exit 1
fi

network="$1"

if ! echo "$networks" | grep "\\b$network\\b" >/dev/null; then
  echo "'$network' is not a known network."
  echo
  usage
  exit 1
fi

DFX_NETWORK="$network" ./config.sh >/dev/null

if grep '=null$' frontend/.env; then
  echo "Something is missing from your canister_ids.json."
  exit 1
fi

cd frontend
npm ci
npm run dev
