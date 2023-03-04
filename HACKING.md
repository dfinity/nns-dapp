# Hacking

This document list a couple of useful information to develop the NNS-dapp frontend.

## dapp development

NNS-dapp frontend uses an `.env` file to read various environment information and variables.

The repo itself does **not** contain any such file because the source of truth we are using is `dfx.json`.
That is why we are providing a `./config.sh` script that generate the above environment file automatically.

## Local

To run the dapp against canisters deployed locally on a simulated IC network, use the steps below, or run `./scripts/dev-local.sh` which guides you through these steps

- Make sure you have a clean local replica running with `dfx start --clean`. This will stay running so use a separate terminal for this.
- Deploy the Nns backend canisters locally with `dfx nns install`
- From the last line of output of `dfx nns install` note down the value url for `nns-dapp`
- Run `DFX_NETWORK=local ./config.sh` to populate the `./frontend/.env` file.
- Manually edit the `./frontend/.env` and replace `null` with the nns-dapp canister id from the url you noted down before.
- Create a file called `canister_ids.json` in `./dfx/local/` with the following content (and make sure to replace the id:
```
{
  "nns-dapp": {
    "local": "<the id from the url from the output of 'dfx nns install'>"
  }
}
```
- In the `./frontend/` folder, first run `npm ci` and then `npm run dev` to serve the application.

With this setup, you can work on the frontend code without building the
nns-dapp canister. If you want to change the backend code, you can deploy it
with `dfx deploy nns-dapp` and it replace the provided canister.

Once you have a running replica with nns installed and a fixed
`./frontend/.env` file, don't have to take all the steps every time.

## Testnet

The [canister_ids.json] data provides the list of canister IDs available for various test environments.

### Configure

To develop and run locally the dapp against a testnet, proceed as following:

- Copy the [canister_ids.json] to the root of your local project
- Run `DFX_NETWORK=<testnet_name> ./config.sh` to populate the `.env` file
- Start `npm run dev` in the `./frontend/` folder to serve the application

e.g. replace `<testnet_name>` with `small11`

## e2e

e2e tests also need a `.env` configuration. Such file can also be generated with the help of the `./config.sh` script by providing a specific output parameter.

e.g. `DFX_NETWORK=<testnet_name> ENV_OUTPUT_FILE=./e2e-tests/.env ./config.sh`

### Running against local server

If you wish to run the e2e tests against your local server, configure the URL as following in `.env` file of the test:

```
VITE_OWN_CANISTER_URL=http://localhost:5173/
```

In addition, the II version deployed locally might be different than the version pinned to run the test. Therefore you might need to adapt the selectors in [./e2e-tests/components/ii-congratulations-page.ts](./e2e-tests/components/ii-congratulations-page.ts).

## Requirements

The `dfx` version installed locally should match the one defined in [dfx.json](https://github.com/dfinity/nns-dapp/blob/main/dfx.json). If not, you will have to either upgrade or manually change the version in the local file. In such case, please do not commit the change!

[canister_ids.json]: https://github.com/dfinity/nns-dapp/blob/testnets/testnets/canister_ids.json
[package.json]: https://github.com/dfinity/nns-dapp/blob/main/frontend/package.json

## ckBTC deployment

> Last update: 2023, Jan. 30

ckBTC deployment and development in NNS-dapp are in progress.

### Bitcoin network

To deploy a local Bitcoin network, the [documentation](https://internetcomputer.org/docs/current/developer-docs/integrations/bitcoin/local-development) on the IC website can be followed.

As ckBTC is not yet implemented in our pipeline, enabling it in `dfx.json` has not yet be done neither - i.e. it needs to be manually configured for testing / development purpose:

Add following in `defaults` of [dfx.json](./dfx.json).

```
"bitcoin": {
  "enabled": true,
  "nodes": [
    "127.0.0.1:18444"
  ]
}
```

### Ledger and minter

Deploying ckBTC ledger and minter are as well not yet automated.

To deploy these locally, a script is provided in [./scripts/ckbtc/deploy-ckbtc](./scripts/ckbtc/deploy-ckbtc).

However, this scripts requires downloading these canisters WASM and did files locally first and configuring these manually in [dfx.json](./dfx.json).

e.g. in `canisters`:

```
"ckbtc_test_minter": {
  "type": "custom",
  "candid": "tmp/minter.did",
  "wasm": "tmp/ckbtc_minter.wasm"
},
"ckbtc_test_ledger": {
  "type": "custom",
  "candid": "tmp/ledger.did",
  "wasm": "tmp/ledger_canister.wasm"
},
"ckbtc_test_index": {
  "type": "custom",
  "candid": "tmp/index.did",
  "wasm": "tmp/index_canister.wasm"
}
```

Once canisters deployed, their respective IDs shall be collected and updated in [canister-ids.constants.ts](./frontend/src/lib/constants/canister-ids.constants.ts).

Likewise, as the configuration is not yet automated, there are no `.env` variable that are yet generated.

### Index

The index canister does not exist yet on mainnet but, will be proposed soon. Same pattern will apply.

### Feature flag

Because the e2e tests are using the `local` environment to perform, we cannot enable the `ENABLE_CKBTC` and `ENABLE_CKTESTBTC` per default. 

Therefore, this flag should also be manually set to `true` in [dfx.json](./dfx.json) and the `.env` should be generated.

## Mint bitcoin

To mint bitcoin you should set up a local bitcoin network as display in the [documentation](https://internetcomputer.org/docs/current/developer-docs/integrations/bitcoin/local-development).

Once ready, 100 block can be minted to an address. The address can be found in the "ckBTC Receive modal".

Example of command:

```bash
./bin/bitcoin-cli -conf=$(pwd)/bitcoin.conf generatetoaddress 100 "bcrt1q286kjxmad4zmhex2dqus4t6u53z49y3shns028"
```

Once block minted, the minter should be unblocked to attribute reward. This can be done by minting more blocks to another address.

e.g.

```bash
./bin/bitcoin-cli -conf=$(pwd)/bitcoin.conf createwallet "test"
./bin/bitcoin-cli -conf=$(pwd)/bitcoin.conf getnewaddress
./bin/bitcoin-cli -conf=$(pwd)/bitcoin.conf generatetoaddress 100 "bcrt1qtq30nuztv40nkncckn70n09tlype96snkxzhmt"
```