#!/usr/bin/env bash
set -euxo pipefail

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
[[ "${1:-}" == "--help" ]] || {
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
ic-cdk-optimizer "./target/wasm32-unknown-unknown/release/${canister_name}.wasm" -o "./${canister_name}.wasm"
gzip -f -n "${canister_name}.wasm"
mv "${canister_name}.wasm.gz" "${canister_name}.wasm"
ls -sh "./${canister_name}.wasm"
sha256sum "./${canister_name}.wasm"
