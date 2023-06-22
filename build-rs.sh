#!/usr/bin/env bash
set -euo pipefail

###############
# Hjelpe meg!
###############
print_help() {
  cat <<-EOF
	Builds a canister wasm file from Rust source code.

	Usage:
	    $(basename "$0") <canister_name> [cargo_flags]
	EOF
}
[[ "${1:-}" != "--help" ]] || {
  print_help
  exit 0
}

###############
# Set working dir, canister name and build args
###############
cd "$(dirname "$0")"
canister_name="$1"
cargo_args=(--target wasm32-unknown-unknown --release --package "$@")

###############
# cargo build # (output: target/release/.../${canister_name}.wasm)
###############
echo "Compiling rust package ${canister_name}"
cargo build "${cargo_args[@]}"

####################
# ic-cdk-optimizer # (output: ${canister_name}.wasm.gz)
####################
echo Optimising wasm
wasm_path="$(canister_name="$canister_name" jq -r '.canisters[env.canister_name].wasm' dfx.json)"
[[ "$wasm_path" != "${wasm_path%.wasm.gz}" ]] || {
  echo "ERROR: dfx.json should have a wasm path ending in .wasm.gz for $canister_name.  It's the new standard..."
  exit 1
} >&2
mkdir -p "$(dirname "$wasm_path")"
ic-cdk-optimizer "./target/wasm32-unknown-unknown/release/${canister_name}.wasm" -o "${wasm_path%.gz}"
gzip -f -n "${wasm_path%.gz}"
rm -f "${wasm_path%.gz}"
ls -sh "${wasm_path}"
sha256sum "${wasm_path}"
