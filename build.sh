#!/usr/bin/env bash

# TODO: add what this does other than "generate wasm"
./generate-wasm.sh nns_ui

# build JavaScript agent
(cd js-agent && ./build.sh)

# build the flutter app
cd dfinity_wallet
flutter build web --web-renderer canvaskit --release --no-sound-null-safety
