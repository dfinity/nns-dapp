# Upgrade frontend NNS Dapp canister to commit `ee26d030a115b9ae2b546ec2564a2358f72fbea5`
Wasm sha256 hash: `7e07ae7e9bc0ff0257bc9659c3435ebc586c0a50dd055b163a020106a2a6b8dd` (`https://github.com/dfinity/nns-dapp/pull/1154/checks`)

## Change Log:

* Fix: Update the proposal schema to match the governance canister

## Commit log:

```
+ bash -xc "git log --format='%C(auto) %h %s' 41e9425c..ee26d030"
 ee26d030 Update proposal definitions (#1154)
 066d667d Option to delete wallet (#1152)
 e52de7ca refactor: *Nullable -> *Nullish (#1149)
 82c0c78c feat: redo open sns projects store (#1151)
 25c0ee6e Release 2022-07-20 (#1146)
 0f38825c build: redo sns and nns js nightly (#1150)
 ce798100 L2 877 list sns tests (#1143)
```

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the nns-dapp repo:

```
git fetch  # to ensure you have the latest changes.
git checkout `ee26d030a115b9ae2b546ec2564a2358f72fbea5`
./scripts/docker-build
sha256sum nns-dapp.wasm
```
