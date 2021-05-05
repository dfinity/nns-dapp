#!/usr/bin/env bash

# build JavaScript agent
(cd js-agent && ./build.sh)

# build the flutter app
cd dfinity_wallet || exit
flutter build web --web-renderer canvaskit --release --no-sound-null-safety

# Bundle into a tight tarball
cd build/web/ || exit
tar cJvf ../../../assets.tar.xz .
cd ../../.. || exit
ls -sh assets.tar.xz

(cd canisters/assets && cargo build --target wasm32-unknown-unknown --release)

