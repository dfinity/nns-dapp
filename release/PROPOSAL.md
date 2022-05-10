# Upgrade frontend NNS Dapp canister to commit `ef166d1f232b0d619dcedde7e4124b17be0e4a7e`
Wasm sha256 hash: `00144e93480963b74fea9cd1cb53e811504fcb6f65ca998aa815eda273c67c88` (`https://github.com/dfinity/nns-dapp/actions/runs/2300511620`)

## Change Log:

* Remove slider option for spawning maturity on wallets that don't support it.
* Confirmation screen in Merge Maturity

## Commit log:

```
+ bash -xc "git log --format='%C(auto) %h %s' 497fb82a..ef166d1f"
 ef166d1f spawn neuron will not give slider option for hardware wallet and will be based on the full maturity (#813)
 b07f9bbd fix: display select account title only if accounts are selectable (#823)
 1ba67c7a Update wasm builder (#805)
 0a53e3f6 refactor: isHexStringBytes -> isHash (#810)
 96e961e5 L2 345 style scrollbar (#794)
 977a114e fix: add scrolling on width proposal action content (#818)
 777644bc L2-500: Confirmation screen in Merge Maturity (#819)
 6c6d453c feat: update verify hardware wallet v2 message (#817)
 2518a61f feat: show invalid name message only if characters have been entered (#814)
 03d8182e style: fix toasts z-index (#812)
 9726829a L2-373: Spawn neuron (#801)
 da73a921 feat: display hardware wallet account name length error (#809)
 b22111aa refactor: ledger error label key with two underscores (#811)
```

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the nns-dapp repo:

git pull  # to ensure you have the latest changes.
git checkout `ef166d1f232b0d619dcedde7e4124b17be0e4a7e`
./scripts/docker-build
sha256sum nns-dapp.wasm
