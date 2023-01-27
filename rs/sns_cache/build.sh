#!/usr/bin/env bash
set -euxo pipefail
cd "$(dirname "$0")/../.."
canister_name=sns_cache
cargo build --target wasm32-unknown-unknown --release -p "$canister_name"
ic-cdk-optimizer "./target/wasm32-unknown-unknown/release/${canister_name}.wasm" -o "./${canister_name}.wasm"
gzip -f -n "${canister_name}.wasm"
mv "${canister_name}.wasm.gz" "${canister_name}.wasm"
ls -sh "./${canister_name}.wasm"
sha256sum "./${canister_name}.wasm"
