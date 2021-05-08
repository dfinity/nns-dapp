#!/usr/bin/env bash

set -x
set -e

# build JavaScript agent
(cd js-agent && ./build.sh)

# build the flutter app
cd dfinity_wallet || exit
flutter build web --web-renderer canvaskit --release --no-sound-null-safety

# Bundle into a tight tarball
cd build/web/ || exit
tar cJv --mtime='2021-05-07 17:00+00' --sort=name  -f ../../../assets.tar.xz .
cd ../../.. || exit
ls -sh assets.tar.xz
sha256sum assets.tar.xz


cargo build --target wasm32-unknown-unknown --release --package nns_ui
