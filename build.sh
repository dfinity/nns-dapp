#!/usr/bin/env bash

set -e

if ! [[ $DEPLOY_ENV = "testnet" ]] && ! [[ $DEPLOY_ENV = "mainnet" ]] && ! [[ $DEPLOY_ENV = "local" ]]; then
  echo "Which deployment environment? Set DEPLOY_ENV to 'testnet' or 'mainnet' or 'local'"
	exit 1
fi

set -x

# build typescript code
(cd frontend/ts && ./build.sh)

# build the flutter app
cd frontend/dart || exit
if [[ $DEPLOY_ENV = "mainnet" ]]; then
  flutter build web --web-renderer html --release --no-sound-null-safety --pwa-strategy=none --dart-define=FLUTTER_WEB_CANVASKIT_URL=/assets/canvaskit/
else
  # For all networks that are not main net, build with the staging config
  flutter build web --web-renderer html --release --no-sound-null-safety --pwa-strategy=none --dart-define=DEPLOY_ENV=staging
fi
sed -i -e 's/flutter_service_worker.js?v=[0-9]*/flutter_service_worker.js/' build/web/index.html

# Bundle into a tight tarball
# On macOS you need to install gtar + xz
# brew install gnu-tar
# brew install xz

cd build/web/ || exit
# Remove the assets/NOTICES file, as it's large in size and not used.
rm assets/NOTICES
tar cJv --mtime='2021-05-07 17:00+00' --sort=name --exclude .last_build_id -f ../../../../assets.tar.xz . || \
gtar cJv --mtime='2021-05-07 17:00+00' --sort=name --exclude .last_build_id -f ../../../../assets.tar.xz .
cd ../../../.. || exit
ls -sh assets.tar.xz
sha256sum assets.tar.xz

echo Compiling rust package
if [[ $DEPLOY_ENV = "mainnet" ]]; then
  cargo build --target wasm32-unknown-unknown --release --package nns-dapp
else
  cargo build --target wasm32-unknown-unknown --release --package nns-dapp --features mock_conversion_rate
fi

echo Optimising wasm
wasm-opt target/wasm32-unknown-unknown/release/nns-dapp.wasm --strip-debug -Oz -o target/wasm32-unknown-unknown/release/nns-dapp-opt.wasm

sha256sum target/wasm32-unknown-unknown/release/nns-dapp-opt.wasm
