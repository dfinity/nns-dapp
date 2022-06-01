# Upgrade frontend NNS Dapp canister to commit `de1a2bd2b78ce4c57e6719be3b739e531ab01d70`
Wasm sha256 hash: `c15730913b8e93040462bd9fc37ad422d491244527d1afdb4084890cc2602146` (`https://github.com/dfinity/nns-dapp/actions/runs/2423394035`)

## Change Log:
* Fix styling of modals on Safari

## Commit log:

```
+ bash -xc "git log --format='%C(auto) %h %s' 66590f2c..de1a2bd2"
 de1a2bd2 style: fix modal height (#939)
 0a7e32bb fix: modal fix (#937)
 c7cd8ce0 L2-598: Top Up Canister (#930)
 2a1e9176 style: fix input placeholder display on Firefox (#934)
 288f91fc feat: simplify canister introduction text (#932)
```

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the nns-dapp repo:

git pull  # to ensure you have the latest changes.
git checkout `de1a2bd2b78ce4c57e6719be3b739e531ab01d70`
./scripts/docker-build
sha256sum nns-dapp.wasm
