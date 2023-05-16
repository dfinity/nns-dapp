#!/usr/bin/env bash
set -euo pipefail

##########################
# Hjelpe meg!
##########################
print_help() {
  cat <<-EOF
	Gets all the sns did files, as specified in dfx.json, and builds the corresponding Rust types.

	To update a type, remove the .did file and rerun.

	To modify the compiled rust, edit the rust file, commit it and run ./mkpatch.sh CANISTER_NAME
	EOF
}
[[ "${1:-}" != "--help" ]] || {
  print_help
  exit 0
}

cd "$(dirname "$(realpath "$0")")"
GIT_ROOT="$(git rev-parse --show-toplevel)"
failed_output=""
for CANISTER_NAME in sns_ledger sns_governance sns_root sns_swap sns_wasm; do
  export CANISTER_NAME
  DID_PATH="${GIT_ROOT}/declarations/${CANISTER_NAME}/${CANISTER_NAME}.did"
  test -f "${DID_PATH}" || (
    cd "$GIT_ROOT"
    cp "$(jq '.canisters[env.CANISTER_NAME].candid' dfx.json)" "$DID_PATH"
  )
  if output=$(./did2rs.sh "${CANISTER_NAME}"); then
    echo "$output"
  else
    failed_output="${failed_output}${output}"
  fi
done

if [[ "$failed_output" != "" ]]; then
  {
    echo "Failed on some canisters:"
    echo "$failed_output"
  } >&2
  exit 1
fi
