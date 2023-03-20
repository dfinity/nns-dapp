#!/usr/bin/env bash

# Fix dependencies in frontend/package{,-lock}.json after running
# `npm run update:agent`.
#
# Running `npm run update:agent` changes some dependencies under "@dfinity/"
# from "next" to something like "^0.0.6-next-2023-03-07.1" in package.json and
# package-lock.json. This script reverts them back to just "next".

set -euo pipefail

top_dir=$(git rev-parse --show-toplevel)

revert_next() {
  package_file="$1"
  backup_extension=".backup"
  sed "-i${backup_extension}" -e 's/\("@dfinity\/.*"\): ".*next.*"/\1: "next"/' "$package_file"
  rm "${package_file}${backup_extension}"
}

cd "$top_dir/frontend"

revert_next package.json
revert_next package-lock.json
