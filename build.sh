#!/usr/bin/env bash

set -e

if [[ $DEPLOY_ENV = "nobuild" ]]; then
  echo "Skipping build as requested"
  exit 0
fi

if ! [[ $DEPLOY_ENV = "testnet" ]] && ! [[ $DEPLOY_ENV = "mainnet" ]] && ! [[ $DEPLOY_ENV = "local" ]]; then
  echo "Which deployment environment? Set DEPLOY_ENV to 'testnet' or 'mainnet' or 'local'"
  exit 1
fi

set -x

# build typescript code. Must happen before the dart build because the dart
# build requires "ic_agent.js" which is generated from frontend/ts.
(cd frontend/ts && ./build.sh)

# Build the Flutter codebase
./frontend/dart/build.sh

rm -f assets.tar.xz
rm -fr web-assets
cp -R frontend/dart/build/web/ web-assets

# Build the svelte app
pushd frontend/svelte || exit
npm ci
npm run build
popd || exit

rm -fr web-assets/v2
cp -R frontend/svelte/public web-assets/v2

# Bundle into a tight tarball
# On macOS you need to install gtar + xz
# brew install gnu-tar
# brew install xz
pushd web-assets || exit
# Remove the assets/NOTICES file, as it's large in size and not used.
rm assets/NOTICES
tar cJv --mtime='2021-05-07 17:00+00' --sort=name --exclude .last_build_id -f ../assets.tar.xz . ||
  gtar cJv --mtime='2021-05-07 17:00+00' --sort=name --exclude .last_build_id -f ../assets.tar.xz .
popd || exit

ls -sh assets.tar.xz
sha256sum assets.tar.xz

echo Compiling rust package
if [[ $DEPLOY_ENV = "mainnet" ]]; then
  cargo build --target wasm32-unknown-unknown --release --package nns-dapp
else
  cargo build --target wasm32-unknown-unknown --release --package nns-dapp --features mock_conversion_rate
fi

echo Optimising wasm
ic-cdk-optimizer target/wasm32-unknown-unknown/release/nns-dapp.wasm -o target/wasm32-unknown-unknown/release/nns-dapp-opt.wasm
ls -sh target/wasm32-unknown-unknown/release/nns-dapp-opt.wasm
sha256sum target/wasm32-unknown-unknown/release/nns-dapp-opt.wasm
