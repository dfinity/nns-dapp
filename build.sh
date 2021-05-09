#!/usr/bin/env bash

# build JavaScript agent
(cd js-agent && ./build.sh)

# build the flutter app
cd dfinity_wallet || exit
flutter build web --web-renderer canvaskit --release --no-sound-null-safety --pwa-strategy=none
sed -i -e 's/flutter_service_worker.js?v=[0-9]*/flutter_service_worker.js/' build/web/index.html

# Bundle into a tight tarball
# On macOS you need to install gtar + xz
# brew install gnu-tar
# brew install xz

cd build/web/ || exit
tar cJv --mtime='2021-05-07 17:00+00' --sort=name --exclude .last_build_id -f ../../../assets.tar.xz . || \
gtar cJv --mtime='2021-05-07 17:00+00' --sort=name --exclude .last_build_id -f ../../../assets.tar.xz .
cd ../../.. || exit
ls -sh assets.tar.xz
sha256sum assets.tar.xz

echo Compiling rust package
cargo build --target wasm32-unknown-unknown --release --package nns_ui

echo Optimising wasm
wasm-opt target/wasm32-unknown-unknown/release/nns_ui.wasm --strip-debug -Oz -o target/wasm32-unknown-unknown/release/nns_ui-opt.wasm

sha256sum target/wasm32-unknown-unknown/release/nns_ui-opt.wasm
