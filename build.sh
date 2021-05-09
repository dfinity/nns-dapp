#!/usr/bin/env bash

set -x
set -e

# build JavaScript agent
(cd js-agent && ./build.sh)

# build the flutter app
cd dfinity_wallet || exit
flutter build web --web-renderer canvaskit --release --no-sound-null-safety  --pwa-strategy=none
# Remove random hash from flutter output
sed -i -e 's/flutter_service_worker.js?v=[0-9]*/flutter_service_worker.js/' build/web/index.html

# Bundle into a tight tarball
cd build/web/ || exit
tar cJv --mtime='2021-05-07 17:00+00' --sort=name --exclude .last_build_id -f ../../../assets.tar.xz .
cd ../../.. || exit
ls -sh assets.tar.xz
sha256sum assets.tar.xz


cargo build --target wasm32-unknown-unknown --release --package nns_ui
cp target/wasm32-unknown-unknown/release/nns_ui.wasm .

# TODO: Make this work outside of docker
ic-cdk-optimizer nns_ui.wasm -o nns_ui.wasm

sha256sum nns_ui.wasm

# If we are in docker build, and the user passed -v out:out, copy files there
if test -d out;
then
  cp -v assets.tar.xz nns_ui.wasm out
fi
