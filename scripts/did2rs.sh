#!/usr/bin/env bash
set -euxo pipefail

##########################
# Hjelpe meg!
##########################
print_help() {
  cat <<-EOF
	Compiles a did file to Rust and applies any saved manual changes.

	Usage: $(basename "$0") <CANISTER_NAME>
	takes inputs:
	  declarations/<CANISTER_NAME>/<CANISTER_NAME>.did
	  rs/sns_aggregator/src/types/<CANISTER_NAME>.patch (optional)
	creates:
	  rs/sns_aggregator/src/types/<CANISTER_NAME>.rs

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
CANISTER_NAME="$(basename "${1%.did}")"
GIT_ROOT="$(git rev-parse --show-toplevel)"

RUST_PATH="${GIT_ROOT}/rs/sns_aggregator/src/types/ic_${CANISTER_NAME}.rs"
PATCH_PATH="${GIT_ROOT}/rs/sns_aggregator/src/types/ic_${CANISTER_NAME}.patch"
DID_PATH="${GIT_ROOT}/declarations/${CANISTER_NAME}/${CANISTER_NAME}.did"

cd "$GIT_ROOT"

##########################
# Translate candid to Rust
##########################
{
  # Here we write the first few lines of the Rust file.
  #
  # This is autogenerated code.  We allow the following:
  #   - Some field names in the API do not follow the Rust naming convention.
  #   - We do not allow the formatter to alter the files, as that would break the patch files.
  #   - Types and fields may be unused or not exactly as clippy might wish.  Tough.
  #
  # We import traits that we apply to the Rust types.
  cat <<-EOF
	#![cfg_attr(rustfmt, rustfmt_skip)]
	#![allow(clippy::all)]
	#![allow(non_camel_case_types)]

	use crate::types::{CandidType, Deserialize, Serialize, EmptyRecord};
	use ic_cdk::api::call::CallResult;
	EOF
  # didc converts the .did to Rust, with the following limitations:
  #   - It applies the canidid Deserialize trait to all the types but not other traits that we need.
  #   - It makes almost all the types and fields private, which is not very helpful.
  #
  # sed:
  #   - adds additional traits after Deserialize
  #   - Makes structures and their fields "pub"
  #
  # Final tweaks are defined manually and encoded as patch files.  The changes typically include:
  #   - Replacing the anonymous result{} type in enums with EmptyRecord.  didc produces valid rust code, but
  #     in a form that the Candid macro cannot handle.  Using a named type works around the limit of the macro.
  #   - We need a few but not all of the types to have the Default macro
  #   - Any corrections to the output of the sed script.  sed is not a Rust parser; the sed output
  #     is not guaranteed to be correct.
  didc bind "${DID_PATH}" --target rs | sed -E 's/^(struct|enum|type) /pub &/g;s/^use .*/\/\/ &/g;s/\<Deserialize\>/&, Serialize, Clone, Debug/g;s/^  [a-z].*:/  pub&/g;s/^( *pub ) *pub /\1/g'
} >"${RUST_PATH}"
if test -f "${PATCH_PATH}"; then
  (
    patch -p1 <"${PATCH_PATH}"
  )
fi
