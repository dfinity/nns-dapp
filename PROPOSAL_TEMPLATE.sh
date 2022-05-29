#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p release
cat <<EOF >release/PROPOSAL.md
# Upgrade frontend NNS Dapp canister to commit \`$(git rev-parse tags/release-candidate)\`
Wasm sha256 hash: \`<WASM_HASH>\` (\`<LINK_TO_GITHUB_ACTION>\`)

## Change Log:

* Write about...
* ... what has changed
* ... in simple bullet points

## Commit log:

\`\`\`
+ bash -xc "git log --format='%C(auto) %h %s' $(git rev-parse --short tags/prod)..$(git rev-parse --short tags/release-candidate)"
$(bash -xc "git log --format='%C(auto) %h %s' $(git rev-parse --short tags/prod)..$(git rev-parse --short tags/release-candidate)")
\`\`\`

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the nns-dapp repo:

git pull  # to ensure you have the latest changes.
git checkout \`$(git rev-parse tags/release-candidate)\`
./scripts/docker-build
sha256sum nns-dapp.wasm
EOF
