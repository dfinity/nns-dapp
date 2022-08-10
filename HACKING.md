# Hacking

This document list a couple of useful information to develop NNS-dapp.

## Environments

Testnets [canister_ids.json] provides an overview of the canister IDs that should be currently deployed and available on various test environments.

## Configure an environment

If you wish to work against a testnet, there are two options:

### 1. Copy canister_ids.json

- Copy the [canister_ids.json] to the root of your local project
- Change the `DFX_NETWORK=<testnet_name>` in the `dev` target script of [package.json] or prefix your `npm` command

e.g. `small11`:

```
"dev": "... DFX_NETWORK=small11 npm run build:config...",
```

or

```bash
DFX_NETWORK=small11 npm run dev
```


### 2. Manual setup

If you need more granularity than above solution:

- collect canister IDs in [canister_ids.json]
- add a new `script` tag in [package.json] and provide `CANISTER_ID` (NNS-dapp self canister ID), `DFX_NETWORK` and `WASM_CANISTER_ID` (if you are developing anything SNS related).

e.g. `small06`:

```json
{
  "script": {
    "small06": "npm run import-assets && npm run i18n && CANISTER_ID=qsgjb-riaaa-aaaaa-aaaga-cai WASM_CANISTER_ID=qvhpv-4qaaa-aaaaa-aaagq-cai DFX_NETWORK=small06 npm run build:config && BASE_HREF=/ ROLLUP_WATCH=true npm run build:index && rollup -c -w"
  }
}
```

### Requirement

The `dfx` version installed locally should match the one defined in [dfx.json](https://github.com/dfinity/nns-dapp/blob/main/dfx.json). If not, you will have to either upgrade or manually change the version in the local file. In such case, please do not commit the change!

[canister_ids.json]: https://github.com/dfinity/nns-dapp/blob/testnets/testnets/canister_ids.json
[package.json]: https://github.com/dfinity/nns-dapp/blob/main/frontend/package.json
