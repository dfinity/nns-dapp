# Upgrade SNS aggregator canister to commit `fab6e718a13d58d23044b708c99910957a671a4d`
Wasm sha256 hash: `1259ea905071fe1d506963d3e70dcced405616a9ccf5b685c616a20b814de622` (`sns_aggregator.wasm`)

## Change Log:

* Add total tokens supply to the aggregator.
* Use stable memory to preserve data over upgrades.
* General maintenance:
  * Update the Rust version

## Commit log:

```
+ bash -xc "git log --format='%C(auto) %h %s' 574fced10..fab6e718a ./rs/sns_aggregator/"
 097677fb9 Bump rust 68 (#2108)
 90e98ba67 GIX-1381: Add total tokens supply to project (#2044)
 88db622df clippy (aggregator): Prohibit panicking except where explicitly allowed (#2072)
 430c72511 Aggregator stable memory serialization &  deserilaization (#2073)
```

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the [nns-dapp repo](https://github.com/dfinity/nns-dapp):

```
git fetch  # to ensure you have the latest changes.
git checkout "fab6e718a13d58d23044b708c99910957a671a4d"
./scripts/docker-build
sha256sum sns_aggregator.wasm
```
