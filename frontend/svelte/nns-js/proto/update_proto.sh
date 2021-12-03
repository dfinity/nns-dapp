#!/usr/bin/env bash
set -euo pipefail
# A script for generating the JS of proto files.
protoc \
  --plugin="protoc-gen-ts=./node_modules/.bin/protoc-gen-ts" \
  --ts_out="./" \
  --js_out="import_style=commonjs,binary:./" \
  --proto_path="./" \
  ./proto/base_types.proto

protoc \
  --plugin="protoc-gen-ts=./node_modules/.bin/protoc-gen-ts" \
  --ts_out="./proto" \
  --js_out="import_style=commonjs,binary:./proto" \
  --proto_path="./proto" \
  ./proto/ledger.proto
