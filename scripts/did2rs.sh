#!/usr/bin/env bash
set -euo pipefail
SOURCE_DIR="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
PATH="$SOURCE_DIR:$PATH"

##########################
# Hjelpe meg!
##########################
print_help() {
  cat <<-EOF
	Compiles a did file to Rust and applies any saved manual changes.

	Usage: $(basename "$0") <CANISTER_NAME>

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

# Source the clap.bash file ---------------------------------------------------
source "$SOURCE_DIR/clap.bash"
# Define options
clap.define short=c long=canister desc="The canister name" variable=CANISTER_NAME
clap.define short=d long=did desc="The did path.  Default: {GIT_ROOT}/declarations/{CANISTER_NAME}/{CANISTER_NAME}.did" variable=DID_PATH
clap.define short=o long=out desc="The path to the output rust file." variable=RUST_PATH default="/dev/stdout"
clap.define short=t long=traits desc='The traits to add to types' variable=TRAITS default=""
clap.define short=h long=header desc="Path to a header to be prepended to every file." variable=HEADER
# Source the output file ----------------------------------------------------------
source "$(clap.build)"

##########################
# Get working dir and args
##########################
CANISTER_NAME="${CANISTER_NAME:-${1:-${DID_PATH:-}}}"
CANISTER_NAME="$(basename "${CANISTER_NAME%.did}")"
GIT_ROOT="$(git rev-parse --show-toplevel)"

RUST_PATH="${RUST_PATH:-/dev/stdout}"
PATCH_PATH="${RUST_PATH%.rs}.patch"
DID_PATH="${DID_PATH:-${GIT_ROOT}/declarations/${CANISTER_NAME}/${CANISTER_NAME}.did}"

cd "$GIT_ROOT"

: "Ensure that tools are installed and working.  Rustfmt in particular can self-upgrade when called and the self-upgrade can fail."
{
  didc --version
  rustfmt --version
} >/dev/null

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
  cat "$HEADER"
  echo
  # didc converts the .did to Rust, with the following limitations:
  #   - It applies the canidid Deserialize trait to all the types but not other traits that we need.
  #   - It makes almost all the types and fields private, which is not very helpful.
  #
  # sed:
  #   - adds additional traits after Deserialize
  #   - Makes structures and their fields "pub"
  #   - Makes API call response types "CallResult".  The alternative convention is to have:
  #       use ic_cdk::api::call::CallResult as Result;
  #     at the top of the rust file but that is both confusing for Rust developers and conflicts
  #     with custom definitions of Result found in some did files.
  #   - didc creates invalid Rust enum entries of the form: `StopDissolving{},`
  #     These are changed to legal Rust: `StopDissolving(EmptyRecord),`
  #     where "EmptyRecord" is defined as the name suggests.
  #
  # Final tweaks are defined manually and encoded as patch files.  The changes typically include:
  #   - Replacing the anonymous result{} type in enums with EmptyRecord.  didc produces valid rust code, but
  #     in a form that the Candid macro cannot handle.  Using a named type works around the limit of the macro.
  #   - We need a few but not all of the types to have the Default macro
  #   - Any corrections to the output of the sed script.  sed is not a Rust parser; the sed output
  #     is not guaranteed to be correct.
  # shellcheck disable=SC2016
  didc bind "${DID_PATH}" --target rs |
    rustfmt --edition 2021 |
    sed -E 's/^(struct|enum|type) /pub &/;
            s@^use .*@// &@;
            s/([{( ]Deserialize)([,})])/\1'"${TRAITS:+,}${TRAITS:-}"'\2/;
            s/^    [a-z].*:/    pub&/;s/^( *pub ) *pub /\1/;
	    /impl Service/,${s/-> Result/-> CallResult/g};
	    /^pub (struct|enum) /,/^}/{s/ *\{\},$/(EmptyRecord),/g};
	    s/\<Principal\>/candid::&/g;
	    ' |
    rustfmt --edition 2021
} >"${RUST_PATH}"
if test -f "${PATCH_PATH}"; then
  (
    patch -p1 <"${PATCH_PATH}"
  )
fi
