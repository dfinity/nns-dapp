# Upgrade frontend NNS Dapp canister to commit `05982aef608988cd2f88855723560203d288cc38`
Wasm sha256 hash: `8ef466f9312b1a70e0ad8902bbe1fb8f1d8d92a477ade18848a4dc3af4d818cd` (`https://github.com/dfinity/nns-dapp/actions/runs/6260505144`)

## Change Log

### Added

* Add the amount of maturity related to a selected percentage.
* Disburse maturity of sns neurons.

### Changed

* Show the token selector also when not signed in.
* Use consistent positioning for the copy icon in the Hash component.
* Allow setting a dissolve delay that's shorter than what's required for voting power.
* Improve contrast of token selector's logo in light theme.
* Remove the "Project" leading word in the SNS Project card.

### Fixed

* Fixed issues with `SetDissolveDelay` component.
* Fix sent transaction icon background color dark theme.
* Improve text color of total value locked's label.
* Make duration rendering consistent.
* Improve tooltip location when container hides part of it.

## Commit Log

```
+ bash -xc "git log --format='%C(auto) %h %s' 3343a1926..05982aef6"
 05982aef6 Bump ic-js (#3345)
 27f62b823 Feat: Remove "Project" from ProjectCard (#3343)
 0e3aa5a50 E2E: Work around images not loading (#3344)
 a84933f15 E2E: Work around flakiness loading proposals (#3342)
 131038dc9 Fix: Better min and max range in disburse maturity (#3340)
 acdf5bd57 Chore: Enable ENABLE_DISBURSE_MATURITY (#3337)
 0971eac57 Update didc release (#3285)
 e0ebbed57 Fix: Tooltip is hidden if container has overflow hidden (#3339)
 30ea2b1ac Feat: Improve message disabled disburse maturity button (#3338)
 270d53534 Update more aggregator data quickly (#3320)
 599d29f13 Feat: Minor change disbursing maturity UI (#3334)
 dcb98b4e2 Fix: SnsStakeMaturityButton spec file (#3335)
 7210dfb49 Chore: Remove unused vars in SnsDisburseMaturityModal (#3336)
 277d7ab8b GIX-1890: Check transaction fee disburse maturity (#3331)
 e99420e43 Fix: Docker build (#3333)
 c5114aa43 GIX-1890: Check tx fee to disable disburse maturity button (#3329)
 63e81ead2 Bump bump ic-js (#3332)
 0a74aedfc Fix: Setup SnsDisburseMaturityModal.spec (#3328)
 570d2f2a9 Chore: Remove dependency on neuron context (#3326)
 72c97480f Remove transfer from IcrcTransferParams (#3324)
 bc0a5a7b8 Add feature flag ENABLE_STAKE_NEURON_ICRC1 (#3319)
 be7f26ce6 Make daysToDuration call secondsToDuration (#3322)
 fe5a7e8f6 GIX-1891: Include active disbursements in maturity section count (#3318)
 253a302df GIX-1889: Fix blank modal disburse maturity (#3317)
 5c8b6fb32 Feat: Improve DisburseMaturityModal information (#3316)
 791ced75a Include artefact sizes in printout (#3308)
 3eb8d9877 Feat: Add amount of maturity to NeuronSelectPercentage (#3314)
 a1e74ad8a Chore: Add warn log if summaries are different (#3313)
 72ba2a598 Update downgrade-upgrade test (#3315)
 d4e8f6697 Fix: Partial different derived state in snsQueryStore (#3312)
 df0966e74 Chore: Add sns agg to debug store (#3311)
 602550351 GIX-1872 Make secondsToDuration consistent with daysToDuration (#3310)
 b106bb4ae Add maturity testnet api support (#3229)
 572a84220 GIX-1872 More and readable tests for secondsToDuration and daysToDuration (#3307)
 2dc3746ce Chore: New changelog (#3302)
 9141f00e4 GIX-1864: Improve ICP logo token selector (#3305)
 36c7ce926 GIX-1878: Fix TVL text color (#3306)
 a13f45356 update ic-js (#3304)
 ea8271b2e Chore: Upgrade gix-components (#3303)
 52cc6ed1b Feat: Add metadata logo path to SNS aggregator data (#3301)
 6ea54921d GIX-1862 Allow setting shorter dissolve delays (#3298)
 49b99288a feat: highlight code in new block of Sns aggregator and style (#3300)
 4efc9e756 GIX-1848: Fix Sent transaction icon background color dark (#3297)
 51e8a1745 remove extra disburse_maturity label (#3299)
 b859d43da Release 2023 09 06 (#3296)
 bcfcb2a08 Active maturity disbursements styles (#3294)
 f7549c036 Snsdemo release (#3291)
 02ca1621e GIX-1874: Dev example SNS Aggregator landing page (#3295)
 377551913 Remove flowLessCopy prop from Hash component (#3293)
 f5f05ac0a Fix and simplify SetDissolveDelay.svelte (#3292)
 48742876b Add tests for SetDissolveDelay component (#3287)
 de32c6adb E2E: Wait for proposal card instead of skeleton card (#3290)
 4207c0a7d Get snsdemo commit from dfx.json (#3288)
 8c009752f GIX-1845 Show universe selector when not signed in (#3280)
 d5daaae51 Spellcheck yaml files (#3276)
 36c7037a2 Get the snsdemo version from dfx.json (#3281)
 f79c80519 Spellcheck - another small step (#3282)
 ef9afd38b Fix empty and missing parameters in canister import (#3286)
```

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the [nns-dapp repo](https://github.com/dfinity/nns-dapp):

```
git fetch  # to ensure you have the latest changes.
git checkout "05982aef608988cd2f88855723560203d288cc38"
./scripts/docker-build
sha256sum nns-dapp.wasm.gz
```

You may also want to verify the canister arguments.  In the proposal they are
binary, which is not very readable. Docker provides both binary and text formats
and you can verify that the text format corresponds to the binary `arg_hex`
field in the proposal.

```
cat nns-dapp-arg-mainnet.did
didc encode "$(cat nns-dapp-arg-mainnet.did)"
```
