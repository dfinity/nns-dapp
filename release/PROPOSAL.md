# Upgrade frontend NNS Dapp canister to commit `5ae1d9bd87a38917c206fbc642f2327f1eeed491`
Wasm sha256 hash: `9cc95005c941e7d4e4a9988c3ca859965bbe7a1d2d61ee7eb7b3d90f9e9c6b63` (`https://github.com/dfinity/nns-dapp/actions/runs/2429826488`)

## Change Log:
* Truncate ICP per request; the full precision will be available
  as a hover text in a future release.

## Commit log:

```
+ bash -xc "git log --format='%C(auto) %h %s' de1a2bd2..5ae1d9bd"
 5ae1d9bd feat: icp thousands separator with quote (#949)
 7513edb3 fix: button height (#948)
 f3d34044 feat: icp two decimals and zero as zero (#947)
 2651d7cb Fix/l2 449 open proposals filter (#926)
 e9c14065 fix: improve mobile button long text support (#944)
 09f146ab L2-597: Detach Canister (#936)
 16a1315c L2-653: Improve Canister Creation UX (#942)
 89f89a62 L2-655: Disable merge neurons button when not enough neurons (#941)
 eb424973 feat: do not reload canisters data on back (#940)
 47a6a810 style: redo a different background for card block on the proposal detail page (#935)
 33e97941 CHANGELOG for modal fix release (#938)
 e6f0d16f CHANGELOG for release on 2022-06-01 (#933)
```

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the nns-dapp repo:

git pull  # to ensure you have the latest changes.
git checkout `5ae1d9bd87a38917c206fbc642f2327f1eeed491`
./scripts/docker-build
sha256sum nns-dapp.wasm
