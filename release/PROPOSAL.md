# Upgrade frontend NNS Dapp canister to commit `66d5bfdec6fd18be3b1625d700340891af5f50a0`
Wasm sha256 hash: `b799cb2a3d96ad92ff0aa15ec4c24d578807d478077e020e108c1b962e420b26` (`https://github.com/dfinity/nns-dapp/pull/1062/checks`)

## Change Log:
* Polyfill CSS to support older browsers
* UI improvements

## Commit log:

```
+ bash -xc "git log --format='%C(auto) %h %s' 4feabf23..66d5bfde"
 66d5bfde Release: 2022-06-30 (#1062)
 0b9bcda4 feat: polyfill inset (#1073)
 3dde04f4 L2-789: Neuron detail realignment (#1072)
 4fa2b73e L2 775 launchpad style adjustment (#1068)
 958ea126 Fix: Remove long button names (#1071)
 ecfccf5a Fix: Button in Project Detail not bottom (#1069)
 26fd269d L2-763: Mock data sns project detail (#1067)
 1d25764c L2 697 accessibility (#1047)
 7c555a70 feat: open csp for data: images (#1063)
 4c237c61 L2 748 proposals block UI (#1058)
 bce7b479 L2 779 launchpad menu entry (#1065)
 5fbd5f6e style: tooltip display with offset if menu open (#1064)
```

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the nns-dapp repo:

```
git fetch  # to ensure you have the latest changes.
git checkout `66d5bfdec6fd18be3b1625d700340891af5f50a0`
./scripts/docker-build
sha256sum nns-dapp.wasm
```
