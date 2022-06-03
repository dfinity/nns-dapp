# Upgrade frontend NNS Dapp canister to commit `80f9b7ab530e964663048690ba57505d9e59ae93`
Wasm sha256 hash: `878a98bbf2449f7e8916002a8adaf7157d010b4aa4c2960ca29df6d1b911d135` (`https://github.com/dfinity/nns-dapp/actions/runs/2434724128`)

## Change Log:
* Provide more detailed values for neuron ICP
* Improve support for earlier versions of iPhone

## Commit log:

```
+ bash -xc "git log --format='%C(auto) %h %s' 5ae1d9bd..80f9b7ab"
 80f9b7ab feat: ICP decimals detailed for neurons (#952)
 3785c3d0 build: bump nns-js and agent-js (#953)
```

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the nns-dapp repo:

git pull  # to ensure you have the latest changes.
git checkout `80f9b7ab530e964663048690ba57505d9e59ae93`
./scripts/docker-build
sha256sum nns-dapp.wasm
