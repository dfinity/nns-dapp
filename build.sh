#!/usr/bin/env bash
#
# First the typescript shim is built and bundled into ic_agent.js, which is
# then added to the frontend/dart codebase. This dart codebase is then built
# into build/web. The frontend/svelte is built into public/. Both the dart
# output (build/web/) and svelte output (public/) are bundled into a tarball,
# assets.tar.xz. This tarball is baked into the wasm binary output at build
# time by cargo, and finally the wasm binary is read by ic-cdk-optimizer and
# optimizer. This scripts outputs a single file, nns-dapp.wasm.
#
#              ic_agent.js               build/web/
#  frontend/ts◄────────────frontend/dart ◄──────────┐
#                                          public/  ├──assets.tar.xz
#                          frontend/svelte◄─────────┘       ▲
#                                                           │
#                                                           │
#                                                      cargo build
#                                                           ▲
#                                                           │ ic-cdk-optimizer
#                                                           │
#                                                      nns-dapp.wasm

set -euo pipefail

TOPLEVEL="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ $DEPLOY_ENV = "nobuild" ]]; then
  echo "Skipping build as requested"
  exit 0
fi

if ! [[ $DEPLOY_ENV = "testnet" ]] && ! [[ $DEPLOY_ENV = "mainnet" ]] && ! [[ $DEPLOY_ENV = "local" ]]; then
  echo "Which deployment environment? Set DEPLOY_ENV to 'testnet' or 'mainnet' or 'local'"
  exit 1
fi

set -x

###############
# frontend/ts # (output: ic_agent.js written to frontend/dart/assets)
###############

# build typescript code. Must happen before the dart build because the dart
# build requires "ic_agent.js" which is generated from frontend/ts.
(cd "$TOPLEVEL/frontend/ts" && ./build.sh)

#################
# frontend/dart # (output: frontend/dart/build/web/)
#################
(cd "$TOPLEVEL/frontend/dart" && ./build.sh)

###################
# frontend/svelte # (output: frontend/svelte/public/)
###################
(cd "$TOPLEVEL/frontend/svelte" && npm ci && npm run build)

#################
# assets.tar.xz #
#################

# we need GNU tar (see below) so we check early
if tar --help | grep GNU >/dev/null; then
  echo "found GNU tar as tar"
  tar="tar"
elif command -v gtar >/dev/null; then
  echo "found GNU tar as gtar"
  tar="gtar"
else
  echo "did not find GNU tar, please install"
  echo "  brew install gnu-tar"
  exit 1
fi

if ! command -v xz >/dev/null; then
  echo "did not find xz, please install"
  echo "  brew install xz"
  exit 1
fi

# We use a local directory, and we don't delete it after the build, so that
# assets can be inspected.
tarball_dir="$TOPLEVEL/web-assets"
rm -rf "$tarball_dir"
mkdir -p "$tarball_dir"
echo "using $tarball_dir for tarball directory"
cp -R "$TOPLEVEL/frontend/dart/build/web/". "$tarball_dir"/
cp -R "$TOPLEVEL/frontend/svelte/public" "$tarball_dir/v2"

# Bundle into a tight tarball
# On macOS you need to install gtar + xz
# brew install gnu-tar
# brew install xz
cd "$tarball_dir"

# Remove the assets/NOTICES file, as it's large in size and not used.
rm assets/NOTICES
"$tar" cJv --mtime='2021-05-07 17:00+00' --sort=name --exclude .last_build_id -f "$TOPLEVEL/assets.tar.xz" .

cd "$TOPLEVEL"

ls -sh "$TOPLEVEL/assets.tar.xz"
sha256sum "$TOPLEVEL/assets.tar.xz"

###############
# cargo build # (output: target/release/.../nns-dapp.wasm)
###############
echo Compiling rust package
cargo_args=(--target wasm32-unknown-unknown --release --package nns-dapp)
if [[ $DEPLOY_ENV != "mainnet" ]]; then
  cargo_args+=(--features mock_conversion_rate)
fi

(cd "$TOPLEVEL" && cargo build "${cargo_args[@]}")

####################
# ic-cdk-optimizer # (output: nns-dapp.wasm)
####################
echo Optimising wasm
cd "$TOPLEVEL"
ic-cdk-optimizer ./target/wasm32-unknown-unknown/release/nns-dapp.wasm -o ./nns-dapp.wasm
ls -sh ./nns-dapp.wasm
sha256sum ./nns-dapp.wasm
