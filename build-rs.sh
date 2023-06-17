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
# ic-cdk-optimizer # (output: ${canister_name}.wasm)
####################
echo Optimising wasm
wasm_path="$(canister_name="$canister_name" jq -r '.canisters[env.canister_name].wasm' dfx.json)"
mkdir -p "$(dirname "$wasm_path")"
ic-cdk-optimizer "./target/wasm32-unknown-unknown/release/${canister_name}.wasm" -o "$wasm_path"
gzip -f -n "${wasm_path}"
mv "${wasm_path}.gz" "${wasm_path}"
ls -sh "${wasm_path}"
sha256sum "${wasm_path}"
