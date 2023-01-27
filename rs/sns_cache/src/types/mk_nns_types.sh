#!/usr/bin/env bash
set -euxo pipefail

##########################
# Hjelpe meg!
##########################
print_help() {
	cat <<-EOF
	Gets all the sns did files, as specified in dfx.json, and builds the corresponding Rust types.

	To update a type, remove the .did file and rerun.
	EOF
}
[[ "${1:-}" != "--help" ]] || {
	print_help
	exit 0
}

cd "$(dirname "$(realpath "$0")")"
GIT_ROOT="$(git rev-parse --show-toplevel)"
for CANISTER in sns_ledger sns_governance sns_root sns_swap sns_wasm ; do
  export CANISTER
  DID_FILE="$PWD/ic_${CANISTER}.did"
  test -f "${DID_FILE}" || (
     cd "$GIT_ROOT"
     cp "$(jq '.canisters[env.CANISTER].candid' dfx.json)" "$DID_FILE"
  )
  ./did2rs.sh "ic_${CANISTER}"
done
