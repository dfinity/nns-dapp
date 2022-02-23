# Upgrade frontend NNS Dapp canister to commit `$COMMIT`
Wasm sha256 hash: `$WASM_HASH` (`$LINK_TO_GITHUB_ACTION`)

## Change Log:

* Write about...
* ... what has changed
* ... in simple bullet points

## Commit log:

```
git log --format="%C(auto) %h %s" ${COMMIT_FROM_LAST_UPGRADE}..${COMMIT}
 ADD THE OUTPUT OF THE ABOVE COMMAND HERE
```

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the nns-dapp repo:

git pull  # to ensure you have the latest changes.
git checkout `$COMMIT`
./scripts/docker-build
sha256sum nns-dapp.wasm
