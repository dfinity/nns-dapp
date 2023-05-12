# Upgrade SNS aggregator canister to commit `c9fa109291c1ca482c6035d36c6c4fdfb2d31ebc`
Wasm sha256 hash: `951503bfd30c16c0cbb0c9f70c2e4adfbb1cb770d45d8e9c593131d7999f2e65` (`sns_aggregator.wasm`)

## Change Log:

* Use new swap canister endpoints.
* Improve logging

## Commit log:

```
+ bash -xc "git log --format='%C(auto) %h %s' a49295c73..c9fa10929 ./rs/sns_aggregator/"
 71ac0fbd1 GIX-1519: Stop using deprecated endpoint in SNS Aggregator. Part 4 (#2426)
 de3868b33 GIX-1519: Stop using deprecated endpoint in SNS Aggregator. Part 3 (#2392)
 8d918cce8 GIX-1519: Stop using deprecated endpoint in SNS Aggregator. Part 2 (#2385)
 c91d68425 GIX-1519: Stop using deprecated endpoint in SNS Aggregator. Part 1 (#2364)
 237405832 Declare feature flag (#2376)
 95134100c test: Get aggregator args & compare with deployment (#2309)
 8556ac997 feat (aggregator): Include timestamps in logs (#2308)
```

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the [nns-dapp repo](https://github.com/dfinity/nns-dapp):

```
git fetch  # to ensure you have the latest changes.
git checkout "c9fa109291c1ca482c6035d36c6c4fdfb2d31ebc"
./scripts/docker-build
sha256sum sns_aggregator.wasm
```
