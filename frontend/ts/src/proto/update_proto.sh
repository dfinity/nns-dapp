#!/usr/bin/env bash
set -euo pipefail
# A script for updating the protobuf files.

protoc \
  --plugin="protoc-gen-ts=./node_modules/.bin/protoc-gen-ts" \
  --ts_out="./src/proto" \
  --js_out="import_style=commonjs,binary:./src/proto" \
  --proto_path="./src/proto" \
  ./src/proto/base_types.proto

protoc \
  --plugin="protoc-gen-ts=./node_modules/.bin/protoc-gen-ts" \
  --ts_out="./src/proto" \
  --js_out="import_style=commonjs,binary:./src/proto" \
  --proto_path="./src/proto" \
  ./src/proto/governance.proto

protoc \
  --plugin="protoc-gen-ts=./node_modules/.bin/protoc-gen-ts" \
  --ts_out="./src/proto" \
  --js_out="import_style=commonjs,binary:./src/proto" \
  --proto_path="./src/proto" \
  ./src/proto/ledger.proto
