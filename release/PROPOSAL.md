# Upgrade frontend NNS Dapp canister to commit `589f27bb1af7933da0f992e92c104f2a804b4164`
Wasm sha256 hash: `<WASM_HASH>` (`<LINK_TO_GITHUB_ACTION>`)

## Change Log:

* Write about...
* ... what has changed
* ... in simple bullet points

## Commit log:

```
+ bash -xc "git log --format='%C(auto) %h %s' 0c1fd54f..589f27bb"
 589f27bb spawn neuron id for unknown neurons is now displayed (#736)
 38fae822 L2-432: Disburse Neuron UI (#732)
 f14da12e Feat: Merge neurons functionality (#715)
 34c2a73d Fix flutter builds (#737)
 2ac2346a fix: hide proposal without ballots when filter-checkbox selected (#735)
 95c8c8e2 Script to make a testnet nns-dapp upgrade proposal (#728)
 f48d8000 e2e test registration revamp (#720)
 978f3cf9 Changelog for release 2022-04-20 (#725)
```

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the nns-dapp repo:

git pull  # to ensure you have the latest changes.
git checkout `589f27bb1af7933da0f992e92c104f2a804b4164`
./scripts/docker-build
sha256sum nns-dapp.wasm
