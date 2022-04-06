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

flutter build web
  --web-renderer html \
  --release --no-sound-null-safety \
  --pwa-strategy=none \
  ${USE_FLUTTER_CANVASKIT:+--dart-define=FLUTTER_WEB_CANVASKIT_URL=/assets/canvaskit/} \
  --dart-define=DEPLOY_ENV="${DEPLOY_ENV:-mainnet}" \
  --dart-define=REDIRECT_TO_LEGACY="${REDIRECT_TO_LEGACY:-prod}"

# Remove the random hash from flutter output
sed -i -e 's/flutter_service_worker.js?v=[0-9]*/flutter_service_worker.js/' build/web/index.html
