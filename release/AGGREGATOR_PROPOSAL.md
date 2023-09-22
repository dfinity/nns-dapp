# Upgrade SNS aggregator canister to commit `05982aef608988cd2f88855723560203d288cc38`
Wasm sha256 hash: `c0861ecbaef42ddabdfa3084f24df7ebae548c9eecb7ea03d6c1b08f284a7f0c` (`sns_aggregator.wasm.gz`)

## Change Log

* In fast updates, update `derived_state` and `lifecycle` as well as the now deprecated `swap_state`.
* New field `logo` in the metadata with the relative path to the logo asset.
* Add a getting started section in landing page.

## Commit Log

```
+ bash -xc "git log --format='%C(auto) %h %s' ee35bc391..05982aef6 ./rs/sns_aggregator/"
 0971eac57 Update didc release (#3285)
 270d53534 Update more aggregator data quickly (#3320)
 52cc6ed1b Feat: Add metadata logo path to SNS aggregator data (#3301)
 49b99288a feat: highlight code in new block of Sns aggregator and style (#3300)
 02ca1621e GIX-1874: Dev example SNS Aggregator landing page (#3295)
 7ba6f577e More work on documentation (#3261)
 4f7bc00c8 Rustdoc - fix (#3170)
 1a924d871 Aggregator favicon, spacing, open color and text clamp (#3154)
 b8e28f217 Release 2023-08-17 (#3139)
 40df9a369 SNS aggregator always supplies an partial last page (#3134)
 3f9463d40 fix: Always update the index.html (#2955)
```

## Forum
Please see the forum post here: FORUM_LINK

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the [nns-dapp repo](https://github.com/dfinity/nns-dapp):

```
git fetch  # to ensure you have the latest changes.
git checkout "05982aef608988cd2f88855723560203d288cc38"
./scripts/docker-build
sha256sum sns_aggregator.wasm.gz
```
