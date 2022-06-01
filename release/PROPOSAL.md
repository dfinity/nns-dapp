# Upgrade frontend NNS Dapp canister to commit `ee3b8a022237b16f416588387a4608da9e180bde`
Wasm sha256 hash: `081111e3f6ca588e3720bf346fd904c6e13f3646cd104ad90b31af0b1da732af` (`https://github.com/dfinity/nns-dapp/actions/runs/2423207101`)

## Change Log:

* Fix modal styling for Safari

## Commit log:

```
+ bash -xc "git log --format='%C(auto) %h %s' 66590f2c..ee3b8a02"
 ee3b8a02 fix: modal fix
 c7cd8ce0 L2-598: Top Up Canister (#930)
 2a1e9176 style: fix input placeholder display on Firefox (#934)
 288f91fc feat: simplify canister introduction text (#932)
```

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the nns-dapp repo:

git pull  # to ensure you have the latest changes.
git checkout `ee3b8a022237b16f416588387a4608da9e180bde`
./scripts/docker-build
sha256sum nns-dapp.wasm
