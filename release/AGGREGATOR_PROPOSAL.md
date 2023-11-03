# Upgrade SNS aggregator canister to commit `ce881da2a61a393da4a0d5c9214c7a4b829e408d`
Wasm sha256 hash: `7ce406a850090c97852a0e5cd1d0d8a94c247ea820d1cd2aab29c4d96f452852` (`sns_aggregator.wasm.gz`)

## Change Log

* Update SNS wasm API.
  * Note: The update exposes fields required for Neurons' Fund changes.

## Commit Log

```
+ bash -xc "git log --format='%C(auto) %h %s' eeefa5e41..ce881da2a ./rs/sns_aggregator/"
 46de1facc Format cargo toml (#3577)
 0a6545a07 Update snsdemo commit (#3593)
 b995a6f33 Add trait (#3591)
 c6a5f4d32 GIX-1994: Preserve provenance (#3570)
```

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the [nns-dapp repo](https://github.com/dfinity/nns-dapp):

```
git fetch  # to ensure you have the latest changes.
git checkout "ce881da2a61a393da4a0d5c9214c7a4b829e408d"
./scripts/docker-build
sha256sum sns_aggregator.wasm.gz
```
