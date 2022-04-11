# Upgrade frontend NNS Dapp canister to commit `b39dd5a91e565e631688f963f3d5577ae6de4bfd`
Wasm sha256 hash: `<WASM_HASH>` (`<LINK_TO_GITHUB_ACTION>`)

## Change Log:

* Write about...
* ... what has changed
* ... in simple bullet points

## Commit log:

```
+ bash -xc "git log --format='%C(auto) %h %s' e971f6d6..b39dd5a9"
 b39dd5a9 Fix flaky tests: Wait for canister to be ready (#683)
 cd6de3c1 Environment argument for controlling the log level (#682)
 eab01072 Proposals tab is shown in prod (#685)
 3aba7c49 Factor out e2e deployment code (#674)
 e4bfe494 Chore: Upgrade nns-js (#671)
 5e420cbc Feat: Neuron authorization improvements (#670)
 e905e4aa Release 2022-04-07 (#669)
 f827583c Bug: Fix dissolve delay when dissolving (#672)
 2147195e Markdown img to link (#673)
 83ab41fb feat: implement transaction step "enter amount" and init step "review" (#666)
```

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the nns-dapp repo:

git pull  # to ensure you have the latest changes.
git checkout `b39dd5a91e565e631688f963f3d5577ae6de4bfd`
./scripts/docker-build
sha256sum nns-dapp.wasm
