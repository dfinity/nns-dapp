# Upgrade frontend NNS Dapp canister to commit `1492c218c778ebe44639e9b00712395913dfd0e0`
Wasm sha256 hash: `b20e53f893875f58adfb526b3959f984b471738d74e41effb64582a0f6a7911e` (`https://github.com/dfinity/nns-dapp/actions/runs/2385262864`)

## Change Log:
* Do not offer merging hardware wallet controlled neurons in the UI, as it is currently not supported.
* Add the ability to dump debug info.
* Prepare for more tabs to be released as svelte.
* Improve the infrastructure for third party contributions.
* More tests.


## Commit log:

```
+ bash -xc "git log --format='%C(auto) %h %s' 4a63f25d..1492c218"
 1492c218 Upgrade nns-js (#906)
 e5345cb1 Fix: Change wordings (#905)
 e05abe0c feat: input type icp (#890)
 8bd718fa L2-616: Disable HW Neurons when merging (#903)
 3b591cd6 Display error message if user tries to merge hardware wallet neurons (#902)
 bf1142d3 Debug store trigger (#900)
 6485ff05 L2-335: List CanisterCards (#899)
 bb7b6b34 Build patched CMC canister and deploy (#901)
 12f2cbb6 L2-585: Setup Cycles Minting and IC Management Canisters (#885)
 632c82a6 E2e neurons (#889)
 e9b67df5 feat: load neurons after sign-in (#898)
 93069dfd button disabled hover state (#869)
 ae5f5882 fix: replace exponential format for ICP amount (#892)
 10498507 Debug stores (#882)
 f6783168 E2e Accounts: Can create linked account (#888)
 5af9a2ec Fix: Style variable instead of prop for Input (#891)
 0449da36 E2e tidy (#887)
 6cb8079e Fix: Propose can load neuron (#886)
 39f9c161 e2e: USER_A1 Verify that main account exists (#883)
 099491e0 E2e voting (#871)
 455da484 Disable guess if --open is specified (#884)
 d6e8efe7 Patch and command needed to set the xrate (#858)
 c8c89d9c L2-479: Validate account id client (#880)
 59f64711 CHANGELOG for release on 2022-05-19 (#876)
 add51aab Don't use the proxy for e2e tests (#839)
 511268d9 Use setup in CI (#874)
 df618b2e Install ic-admin (#878)
 903acf70 Add CODEOWNERS file (#647) (#877)
```

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the nns-dapp repo:

git pull  # to ensure you have the latest changes.
git checkout `1492c218c778ebe44639e9b00712395913dfd0e0`
./scripts/docker-build
sha256sum nns-dapp.wasm
