#!/usr/bin/env bash

# This script aims to hold the user by the hand to get a local development
# setup working. It's not meant to be suitable to use every time as it would
# force you to take all steps from scratch.
#
# Once you have a replica with nns-dapp and your node modules installed, then
# next time you can simply run `npm run dev` from the frontend directory.
#
# With this setup, you can work on the frontend code without building the
# nns-dapp canister. If you want to change the backend code, you can deploy it
# with `dfx deploy nns-dapp` and it replace the provided canister.

set -euo pipefail

top_dir=$(git rev-parse --show-toplevel)
cd "$top_dir"

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

if ! pgrep icx-proxy >/dev/null; then
  echo "You need a local replica."
  echo "A 'local replica' is what you get by running 'dfx start --clean'."
  echo "Make sure you run the command from the nns-dapp repo. The dfx.json file in the repo makes sure the subnet type is set to 'system' instead of 'application'."
  echo "You need it to keep running so do it from a separate terminal."
  echo "If you've already started it, it may take a few seconds before it's ready."
  exit 1
fi

nns_install_log=$(mktemp -t 'nns-install')
echo "Running 'dfx nns install'. This may take a minute... Output is logged to $nns_install_log"
if ! nns_dapp_url=$(dfx nns install 2>"$nns_install_log" | grep "^nns-dapp" | awk '{print $2}'); then
  echo "'dfx nns install' failed. Make sure you started a clean local replica and didn't do anything with it after running 'dfx start --clean'."
  echo "Try killing your local replica and starting it again."
  echo "You can also check the log file for errors: $nns_install_log"
  echo
  echo "Here are the last (up to) 10 lines:"
  tail -10 "$nns_install_log"
  exit 1
fi
rm "$nns_install_log"

# shellcheck disable=SC2001
nns_dapp_canister_id=$(echo "$nns_dapp_url" | sed -e "s@http://\([^.]*\).localhost:8080/@\1@")
DFX_NETWORK=local ./config.sh >/dev/null 2>/dev/null
mv frontend/.env frontend/.env-with-null
sed -e "s@null@${nns_dapp_canister_id}@" frontend/.env-with-null >frontend/.env
rm frontend/.env-with-null

local_ids=".dfx/local/canister_ids.json"
mkdir -p "$(dirname "$local_ids")"
if ! [ -f "$local_ids" ]; then
  echo "{
  \"nns-dapp\": {
    \"local\": \"$nns_dapp_canister_id\"
  }
}" >$local_ids
fi

cd frontend
npm ci
npm run dev
