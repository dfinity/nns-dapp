#!/usr/bin/env bash
set -euxo pipefail

##########################
# Hjelpe meg!
##########################
print_help() {
	cat <<-EOF
    Makes a patch file for a rust file gfrom local customizations.

	Usage: $(basename "$0") <canister_name>
	takes inputs:
	  <canister_name>.did
	  <canister_name>.rs (must be committed as it will be changed)
	creates:
	  <canister_name>.patch

	EOF
}
[[ "${1:-}" != "--help" ]] || {
	print_help
	exit 0
}

##########################
# Get working dir and args
##########################
cd "$(dirname "$0")"
canister_name="$(basename "${1%.did}")"

rm -f "${canister_name}.patch"
./did2rs.sh "$canister_name"
git diff -R "${canister_name}.rs" > "${canister_name}.patch"
if test -s "${canister_name}.patch"
then git add "${canister_name}.patch"
else rm -f "${canister_name}.patch"
fi
./did2rs.sh "$canister_name"
