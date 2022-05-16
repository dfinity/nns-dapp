#!/usr/bin/env bash
#
# Build the flutter app. This populates ./build/web/, a directory that has the
# same hierarchy as how the files should be served.

set -euo pipefail

MYPATH="$(
  cd -- "$(dirname "$0")" >/dev/null 2>&1
  pwd -P
)"

echo "Assuming dart codebase path is $MYPATH"
cd "$MYPATH"

DEPLOY_ENV="${DEPLOY_ENV:-${DFX_NETWORK:-}}"
if [[ $DEPLOY_ENV = "mainnet" ]]; then
  flutter build web --web-renderer html --release --no-sound-null-safety --pwa-strategy=none --dart-define=FLUTTER_WEB_CANVASKIT_URL=/assets/canvaskit/ --dart-define=REDIRECT_TO_LEGACY="prod"
else
  # For all networks that are not mainnet, build with the staging config
  flutter build web --web-renderer html --release --no-sound-null-safety --pwa-strategy=none --dart-define=DEPLOY_ENV=staging --dart-define=REDIRECT_TO_LEGACY="${REDIRECT_TO_LEGACY:-prod}"
fi

# Remove the random hash from flutter output
sed -i -e 's/flutter_service_worker.js?v=[0-9]*/flutter_service_worker.js/' build/web/index.html
