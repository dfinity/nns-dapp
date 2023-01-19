#!/usr/bin/env bash
set -euo pipefail
TOPLEVEL="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

###################
# frontend # (output: frontend/public/)
###################
(cd "$TOPLEVEL/frontend" && npm ci && npm run build)

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
echo "using $tarball_dir for tarball directory"
cp -R "$TOPLEVEL/frontend/public/" "$tarball_dir/"

# Bundle into a tight tarball
# On macOS you need to install gtar + xz
# brew install gnu-tar
# brew install xz
cd "$tarball_dir"

"$tar" cJv --mtime='2021-05-07 17:00+00' --sort=name --exclude .last_build_id -f "$TOPLEVEL/assets.tar.xz" .

cd "$TOPLEVEL"

ls -sh "$TOPLEVEL/assets.tar.xz"
sha256sum "$TOPLEVEL/assets.tar.xz"
