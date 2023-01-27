#!/usr/bin/env bash
set -euxo pipefail

##########################
# Hjelpe meg!
##########################
print_help() {
	cat <<-EOF
	Gets all the sns did files, as specified in dfx.json, and builds the corresponding Rust types.
	EOF
}
[[ "${1:-}" != "--help" ]] || {
	print_help
	exit 0
}

cd "$(dirname "$(realpath "$0")")"
GIT_ROOT="$(git rev-parse --show-toplevel)"
for canister in sns_ledger sns_governance sns_root sns_swap sns_wasm ; do
  export canister
  (
     cd "$GIT_ROOT"
     cat "$(jq '.canisters[env.canister].candid' dfx.json)"
  ) > "ic_${canister}.did"
  ./wasm2types.sh "${canister}"
done
