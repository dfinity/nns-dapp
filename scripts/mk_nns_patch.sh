#!/usr/bin/env bash
set -euxo pipefail

##########################
# Hjelpe meg!
##########################
print_help() {
  cat <<-EOF
    Makes a patch file for a rust file gfrom local customizations.

	Usage: $(basename "$0") <CANISTER_NAME>
	takes inputs:
	  <CANISTER_NAME>.did
	  <CANISTER_NAME>.rs (must be committed as it will be changed)
	creates:
	  <CANISTER_NAME>.patch

	EOF
}
[[ "${1:-}" != "--help" ]] || {
  print_help
  exit 0
}

##########################
# Get working dir and args
##########################
GIT_ROOT="$(git rev-parse --show-toplevel)"
CANISTER_NAME="$1"

RUST_PATH="${GIT_ROOT}/rs/sns_cache/src/types/ic_${CANISTER_NAME}.rs"
PATCH_PATH="${GIT_ROOT}/rs/sns_cache/src/types/ic_${CANISTER_NAME}.patch"
DID_PATH="${GIT_ROOT}/declarations/${CANISTER_NAME}/${CANISTER_NAME}.did"

cd "$GIT_ROOT"

rm -f "${PATCH_PATH}"
scripts/did2rs.sh "$CANISTER_NAME"
git diff -R "${RUST_PATH}" >"${PATCH_PATH}"
if test -s "${PATCH_PATH}"; then
  git add "${PATCH_PATH}"
else
  rm -f "${PATCH_PATH}"
fi
scripts/did2rs.sh "$CANISTER_NAME"
