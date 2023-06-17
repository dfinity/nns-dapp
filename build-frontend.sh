#!/usr/bin/env bash
set -euo pipefail
TOPLEVEL="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Verify that we have the configuration
test -e frontend/.env || {
  echo "ERROR: Building the frontend requires a config file."
  echo "       Please create the config file by running config.sh."
  exit 1
} >&2

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

# Archive and remove sourcemap files.
find . -name '*.map' | "$tar" cJv \
  --files-from=- \
  --remove-files \
  -f "$TOPLEVEL/sourcemaps.tar.xz"

# shellcheck disable=SC2038 # We have sane filenames, without return characters in them.
find . -type f | xargs -I{} gzip -fn "{}"

# --mtime, --sort, --owner, --group, --numeric-owner and --format are all
# there to get a tarball that's reproducible across different platforms.
# See https://reproducible-builds.org/docs/archives/
"$tar" cJv \
  --mtime='2021-05-07 17:00Z' \
  --sort=name \
  --owner=0 \
  --group=0 \
  --numeric-owner \
  --format=ustar \
  --exclude .last_build_id \
  -f "$TOPLEVEL/assets.tar.xz" \
  .

cd "$TOPLEVEL"

ls -sh "$TOPLEVEL/assets.tar.xz"
sha256sum "$TOPLEVEL/assets.tar.xz"
