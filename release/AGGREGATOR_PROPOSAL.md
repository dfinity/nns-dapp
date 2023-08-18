# Upgrade SNS aggregator canister to commit `0de08b5e7e9d5fc9ab58630604ea35c25abbd223`
Wasm sha256 hash: `e6f0e4b7441d5b1707f8945009c0ec465b74d80770bda620d0cd82cdeaa1f5f6` (`sns_aggregator.wasm.gz`)

## Change Log
* Ensure that the last paginated entry is incomplete, as requested by the nns-dapp front end developers.
* Update the index.html when it has changed.

## Commit Log

```
+ bash -xc "git log --format='%C(auto) %h %s' ee35bc391..0de08b5e7 ./rs/sns_aggregator/"
 40df9a369 SNS aggregator always supplies an partial last page (#3134)
 3f9463d40 fix: Always update the index.html (#2955)
```

## Forum
Please see the forum post here: https://forum.dfinity.org/t/sns-aggregator-release/22249

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the [nns-dapp repo](https://github.com/dfinity/nns-dapp):

```
git fetch  # to ensure you have the latest changes.
git checkout "0de08b5e7e9d5fc9ab58630604ea35c25abbd223"
./scripts/docker-build
sha256sum sns_aggregator.wasm.gz
```
