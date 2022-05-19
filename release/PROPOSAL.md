# Upgrade frontend NNS Dapp canister to commit `4a63f25d540ccac94968dc7d29cc70b60ecd5a9b`
Wasm sha256 hash: `c6b16dc9fa2f330899c20f44d0477d38498688bd0c56b56273b753a64cf74331` (`https://github.com/dfinity/nns-dapp/actions/runs/2351043904`)

## Change Log:

- Update mechanics for creating canisters
- Prepare to release the neuron and accounts tabs in flutter

## Commit log:

```
+ bash -xc "git log --format='%C(auto) %h %s' ef166d1f..4a63f25d"
 4a63f25d Call directly into CMC to create or top up a canister (#850)
 f42bf9cb Add cycles minting canister ID (#875)
 09adc534 set fitting height for dissolve delay modal (#870)
 a80cd605 Fix: Close After New Followee change (#872)
 3f868ee3 e2e test for USER-N01 (#865)
 f6a83b84 feat: avoid transaction list flickering after new transaction (#868)
 c77be11f Make proposals via ic-admin (#798)
 3437e597 fix: exclude test utils from bundle (#866)
 5f8da81a refactor: use selected account context (#867)
 335aae3e L2 429 account details transactions history (#840)
 9016257c L2-571: Redirect if current user removed hotkeys (#860)
 1f376564 feat: instead of spinner, make buttons disabled if busy (#864)
 c77f86df Simplify deployments (#828)
 d2c3048c Read e2e env vars in the same way as svelte (#861)
 a5914066 feat: attach hardware wallet neuron to nns-dapp (#859)
 c7c18202 L2-526: Error management neurons with Hardware Wallet (#857)
 903d767c chore: remove unused global transaction store (#856)
 e2498615 L2-524: New Neuron Flow working for HW (#852)
 dea3feeb style: fix modal max height (#855)
 9065f6dc refactor: start busy with object params (#853)
 e5c8a132 style: busy text as paragraph (#854)
 3a80faa1 feat: list harware wallet neurons (#851)
 cd9705a7 Setup (#832)
 10c397cf L2-520: Show message busy screen (#848)
 05c2b678 chore: remove unused function (#849)
 9788d082 build: fix ledger chunking (#847)
 6dc91956 L2-486: Neurons functionality compatible with hardware wallet (#846)
 542f8b72 build: fix canister id for local development (#845)
 60324fce L2 467 fix modal height (#820)
 d489b2bc Support opening the dashboard of locally deployed networks (#844)
 764c5b34 Chore: add small06 to dfx (#843)
 42f39809 L2-514: Hide slider spawning from hardware wallet (#836)
 6c0b6344 Fix typescript in e2e tests (#841)
 11b8909f Bump chromedriver (#838)
 36f3eace feat: rename subaccount (#835)
 be51e1aa http not https (#837)
 eab8fe8c L2-523: Screen to add user's principal to hotkeys (#834)
 67eb040e Pre-build nns canister docker file for caching (#833)
 f14fd720 feat: show principal and address on hardware wallet (#831)
 6b0f9f78 build: bump dependencies (#830)
 17123415 scrollbar color match (#827)
 578e7a88 Make the multi-tab login test work again (#676)
 92ef541a Patch more (#829)
 72730878 L2-527: Disable Confirm Spawn if not enough (#825)
 20956270 Fix: local setup uses nnsdapp_both environment (#826)
 b05e24c6 L2-516: Create neuron hardware wallet (#821)
 6b4cb3f5 CHANGELOG for release 2022-05-10 (#824)
 22929363 Testnet environments (#816)
 855471da Placeholder changelog for release on 2022-05-09 (#808)
 f568cd02 Update CHANGELOG for release (#783)
 832ea289 Fix: Local dev setup (#815)
 ca105e7d feat: new transaction from hardware wallet (#822)
```

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the nns-dapp repo:

git pull  # to ensure you have the latest changes.
git checkout `4a63f25d540ccac94968dc7d29cc70b60ecd5a9b`
./scripts/docker-build
sha256sum nns-dapp.wasm
