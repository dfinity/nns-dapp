# Upgrade frontend NNS Dapp canister to commit `66590f2c40732925d16bada058a2cccb2f3448c2`
Wasm sha256 hash: `c79cf8d97bd528fdd091f8ec12de6c382f80cba266bdbd75130f855739f32b0b` (`https://github.com/dfinity/nns-dapp/actions/runs/2420775469`)

## Change Log:

* Display the svelte version of the accounts and neurons tabs.
* Move the hardware wallet CLI out into a separate repository.
* Improvements to the UI.
* More tests

## Commit log:

```
+ bash -xc "git log --format='%C(auto) %h %s' 1492c218..66590f2c"
 66590f2c style: fix small modal height on mobile devices (#931)
 2481a785 fix/feat: canister icp <-> cycles (#929)
 83d4a448 Release accounts and neurons tabs (#894)
 7761cf0d Update nns-js (#928)
 5ef980ed e2e test to merge neurons (#918)
 12b1b3f8 Fix: Improve split and spawn neuron (#925)
 9b7ea8ca feat: display title "My accounts" on select accounts component if user has hardware wallets too (#924)
 7c159280 e2e: Test proposal filters (#893)
 dad24a06 L2-227: Create Canister part II (#923)
 ee038bb6 style: prevent overflow-x on neurons detail page (workaround) (#917)
 1d7b54e7 feat: pre-fill subaccount input for rename (#921)
 47b99061 feat: shorten transaction fee display (#920)
 09251abe L2-599: Canister Detail Cards UI (#919)
 e4c3d962 L2-227: Create canister flow Part I (#914)
 d84ed4df refactor: rename and move error types (#916)
 87fb19a6 style: clean css colors (#915)
 77b438b3 Changelog for release on 2022-05-25 (#904)
 76df2398 Remove hardware wallet CLI (#913)
 e82a5115 L2-334: Setup Canister Detail Page (#910)
 117076df fix: meta lang and charset (#488)
 d70ee5c3 Fix: Scroll on Collapsible only when needed (#911)
 12855229 L2-608: Fix neuron stake update after transaction (#895)
 e71a7635 L2-596: Link existing canister (#909)
```

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the nns-dapp repo:

git pull  # to ensure you have the latest changes.
git checkout `66590f2c40732925d16bada058a2cccb2f3448c2`
./scripts/docker-build
sha256sum nns-dapp.wasm
