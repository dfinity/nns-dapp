#!/usr/bin/env bash
set -euxo pipefail

##########################
# Hjelpe meg!
##########################
print_help() {
  cat <<-EOF
	Compiles a did file to Rust and applies any saved manual changes.

	Usage: $(basename "$0") <canister_name>
	takes inputs:
	  <canister_name>.did
	  <canister_name>.patch (optional)
	creates:
	  <canister_name>.rs

	Hint: To create a patchfile:
	  - Customise the built rust file to your heart's content.
	  - Commit the modified file.
	  - Remove any existing patchfile.
	  - Make a clean build (this will undo your changes)
	  - Run: git diff -R \$CANISTER_NAME.rs > \CANISTER_NAME.patch
	  - Check out the rust file to recover your changes.
	  - Now, rebuilding should create a file with your changes.

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

{
  cat <<-EOF
	#![cfg_attr(rustfmt, rustfmt_skip)]
	#![allow(non_camel_case_types)]

	use crate::types::{CandidType, Deserialize, Serialize, EmptyRecord};
	use ic_cdk::api::call::CallResult;
	EOF
  didc bind "${canister_name}.did" --target rs | sed -E 's/^(struct|enum|type) /pub &/g;s/^use .*/\/\/ &/g;s/\<Deserialize\>/&, Serialize, Clone, Debug/g;s/^  [a-z].*:/  pub&/g;s/^( *pub ) *pub /\1/g'
} >"${canister_name}.rs"
PATCHFILE="$(realpath "${canister_name}.patch")"
if test -f "${PATCHFILE}"; then
  (
    GIT_ROOT="$(git rev-parse --show-toplevel)"
    cd "$GIT_ROOT"
    patch -p1 <"${PATCHFILE}"
  )
fi
