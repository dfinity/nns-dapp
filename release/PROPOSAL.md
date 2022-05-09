# Upgrade frontend NNS Dapp canister to commit `497fb82af0ac02b4572fd011521cd481696c168d`
Wasm sha256 hash: `67166f3b6d350762036446fb8c464e97bafe1a7cdd436743c4493e9518572b26` (`https://github.com/dfinity/nns-dapp/actions/runs/2292792271`)

## Change Log:

* Render 32 byte hashes in proposals as strings rather than byte arrays
* New JSON payload renderer
* Refactor the configuration to suport more testing scenarios
* Prepare to render the Neurons tab using svelte
* Fix CSP domains

## Commit log:

```
+ bash -xc "git log --format='%C(auto) %h %s' 236f2fdb..497fb82a"
 497fb82a Remove configuration values from svelte (#803)
 1e834bec Fix/recover subnet payload state hash (#807)
 6379bbd5 L2-339: Add Hardware Wallet Accounts to Store (#804)
 b90fde7a Fix: Clean Notifications Code (#806)
 78c804d9 Remove duplicate hardware wallet transactions (#790)
 2aa18b6e Feat/json view (#800)
 aefe7ebc L2-446: ToastsStore manages multiple notifications (#799)
 86155a4c Rm flutter config (#802)
 27e3c18c Use root config (#796)
 76479ce8 feat: attach hardware wallet (#791)
 3e0eb978 Fix CSP domains (#793)
 0f232bbf bump nns-js (#792)
 b3f61d53 Restrict how process.env may be used (#789)
 de1ffbb1 L2-512: Hide remove hotkeys if not controller (#788)
 1c9aa4a4 feat: connect hardware wallet (#785)
 3cb07334 Fix deploy (#786)
 c8ccd3c8 Fix: replace identityServiceURL with host to interact with accounts canister (#784)
 c354b90f L2-483: Lazy load voted proposals in Neuron Voting History (#782)
```

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the nns-dapp repo:

git pull  # to ensure you have the latest changes.
git checkout `497fb82af0ac02b4572fd011521cd481696c168d`
./scripts/docker-build
sha256sum nns-dapp.wasm
