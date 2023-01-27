#!/usr/bin/env bash
set -euxo pipefail
cargo build --target wasm32-unknown-unknown --release -p sns_cache --color always 2>&1 #|& head -n 100
