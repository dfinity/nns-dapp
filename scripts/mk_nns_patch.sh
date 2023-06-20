#!/usr/bin/env bash
set -euo pipefail
SOURCE_DIR="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

# Checks whether we have the .did file for a canister.
#
# # Input
# - Canister names on stdin, one per line
#
# # Output
# - Canister names, one per line
filter_has_canister_did() {
  while read -r canister; do
    if test -e "$SOURCE_DIR/../declarations/${canister}/${canister}.did"; then
      echo "$canister"
    fi
  done
}

GIT_ROOT="$(git rev-parse --show-toplevel)"
# shellcheck disable=SC2012
ALL_CANISTERS="$(ls "$GIT_ROOT/declarations" | filter_has_canister_did)"

##########################
# Hjelpe meg!
##########################
print_help() {
  cat <<-EOF
    Makes a patch file for a rust file from local customizations.

	Usage: $(basename "$0") [ <CANISTER_NAME> ]
	takes inputs:
	  <CANISTER_NAME>.did
	  <CANISTER_NAME>.rs (must be committed as it will be changed)
	creates:
	  <CANISTER_NAME>.patch

	If no <CANISTER_NAME> is given, the script is run once for each of:
	$ALL_CANISTERS

	EOF
}
[[ "${1:-}" != "--help" ]] || {
  print_help
  exit 0
}

if [[ -z "${1:-}" ]]; then
  for CANISTER_NAME in $ALL_CANISTERS; do
    "$0" "$CANISTER_NAME"
  done
  exit 0
fi

CANISTER_NAME="$1"

RUST_PATH="${GIT_ROOT}/rs/sns_aggregator/src/types/ic_${CANISTER_NAME}.rs"
PATCH_PATH="${GIT_ROOT}/rs/sns_aggregator/src/types/ic_${CANISTER_NAME}.patch"

cd "$GIT_ROOT"

rm -f "${PATCH_PATH}"
scripts/did2rs.sh "$CANISTER_NAME"
git -c core.abbrev=9 diff -R "${RUST_PATH}" >"${PATCH_PATH}"
if test -s "${PATCH_PATH}"; then
  git add "${PATCH_PATH}"
else
  rm -f "${PATCH_PATH}"
fi
scripts/did2rs.sh "$CANISTER_NAME"
