# Hacking

This document list a couple of useful information to develop the NNS-dapp frontend.

## Table of contents

- [dapp development](#dapp-development)
- [Local](#local)
- [Testnet](#testnet)
- [Preview](#preview)
  - [Configure](#configure)
- [e2e](#e2e)
  - [Running against local server](#running-against-local-server)
- [Requirements](#requirements)
- [Dependencies](#dependencies)
- [ckBTC deployment](#ckbtc-deployment)
  - [Bitcoin network](#bitcoin-network)
  - [Ledger, Index and Minter](#ledger-index-and-minter)
  - [Feature flag](#feature-flag)
- [Mint bitcoin](#mint-bitcoin)
- [Visual comparisons](#visual-comparisons)

## dapp development

NNS-dapp frontend uses an `.env` file to read various environment information and variables.

The repo itself does **not** contain any such file because the source of truth we are using is `dfx.json`.
That is why we are providing a `./config.sh` script that generate the above environment file automatically.

## Local

To run the dapp against canisters deployed locally on a simulated IC network, use the steps below, or run `./scripts/dev-local.sh` which guides you through these steps

- Make sure you have a clean local replica running with `dfx start --clean`. This will stay running so use a separate terminal for this.
- Deploy the NNS backend canisters locally with `dfx nns install`
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

## Preview

To run a production like environment locally against a replica run:

```bash
DFX_NETWORK=<replica-network> ../config.sh
npm run build
npm run preview
```

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

If you wish to run the e2e tests against your local server, please note:

- The II version deployed locally might be different than the version pinned to run the test. Therefore you might need to adapt the selectors in [./e2e-tests/components/ii-congratulations-page.ts](./e2e-tests/components/ii-congratulations-page.ts).

## Requirements

The `dfx` version installed locally should match the one defined in [dfx.json](https://github.com/dfinity/nns-dapp/blob/main/dfx.json). If not, you will have to either upgrade or manually change the version in the local file. In such case, please do not commit the change!

[canister_ids.json]: https://github.com/dfinity/nns-dapp/blob/testnets/testnets/canister_ids.json
[package.json]: https://github.com/dfinity/nns-dapp/blob/main/frontend/package.json

## Dependencies

It's essential to keep our dependencies up-to-date to benefit from the latest features, bug fixes, and security patches.

In this guide, we will walk you through the process of checking for newer dependencies and updating them for your frontend dapp using the [npm-check-updates](https://github.com/raineorshine/npm-check-updates) tool.

1. Install `npm-check-updates`:

First, make sure you have Node.js and npm (Node Package Manager) installed on your system. If not, you can download and install them from the official Node.js website (https://nodejs.org).

To install the `npm-check-updates` tool, open your terminal and run the following command:

```bash
npm install -g npm-check-updates
```

2. Navigate to the Frontend Folder:

Navigate to the folder where the frontend dapp is located.

```bash
cd frontend
```

3. Check for Newer Dependencies:

Identify the available newer versions of the dependencies. Run the following command in your terminal:

```bash
ncu -u
```

This command will provide you with a list of available updates and automatically update the `package.json` file with the newer versions.

4. Review and Modify `package.json`:

Open the `package.json` file in a text editor. Review the changes made by the tool and consider whether you want to update all the libraries or selectively update specific ones.

If there are dependencies you do not want to update at this point, you can manually revert the changes in the file by reverting the corresponding lines.

5. Install Newer Dependencies:

To effectively install the updated dependencies, execute the following command in your terminal:

```bash
npm i
```

This command will install the newer versions of the dependencies and update the `package-lock.json` file accordingly.

6. Thoroughly Test The Dapp:

After the installation is complete, it's crucial to thoroughly test the frontend dapp. Ensure that all the functionalities are working as expected and there are no compatibility issues with the updated dependencies.

7. Create a Pull Request (PR):

If everything looks good and the frontend dapp is functioning correctly with the updated dependencies, it's time to create a pull request. Include the modified `package.json` and `package-lock.json` files in a new PR to let others review and merge the changes.

## ckBTC deployment

> Last update: 2023, May 1

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

### Ledger, Index and Minter

Deploying ckBTC ledger, index and minter are as well not yet automated.

Their wasm and candid file can be downloaded with a script which finds place in [./scripts/ckbtc/download-ckbtc](./scripts/ckbtc/download-ckbtc).

```
./scripts/ckbtc/download-ckbtc
```

To deploy the canisters locally, a script is provided in [./scripts/ckbtc/deploy-ckbtc](./scripts/ckbtc/deploy-ckbtc) as well.

However, it requires first to manually edit [dfx.json](./dfx.json).

e.g. in `canisters`:

```
"ckbtc_minter": {
  "type": "custom",
  "candid": "target/ic/ckbtc_minter.did",
  "wasm": "target/ic/ckbtc_minter.wasm"
},
"ckbtc_ledger": {
  "type": "custom",
  "candid": "target/ic/ckbtc_ledger.did",
  "wasm": "target/ic/ckbtc_ledger.wasm"
},
"ckbtc_index": {
  "type": "custom",
  "candid": "target/ic/ckbtc_index.did",
  "wasm": "target/ic/ckbtc_index.wasm"
},
"ckbtc_kyt": {
  "type": "custom",
  "candid": "target/ic/ckbtc_kyt.did",
  "wasm": "target/ic/ckbtc_kyt.wasm"
},
```

Once set, the script can be executed.

> Note: when the script is run, the network should be provided

```bash
DFX_NETWORK=local ./scripts/ckbtc/deploy-ckbtc
```

After deployment, their respective IDs shall be collected and updated in [ckbtc-canister-ids.constants.ts](./frontend/src/lib/constants/ckbtc-canister-ids.constants.ts).

Likewise, as the configuration is not yet automated, there are no `.env` variable that are yet generated.

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

## Visual comparisons

From Playwright [documentation](https://playwright.dev/docs/test-snapshots):

> Playwright Test includes the ability to produce and visually compare screenshots using `await expect(page).toHaveScreenshot()`. On first execution, Playwright test will generate reference screenshots. Subsequent runs will compare against the reference.

To implement a new test that relies on comparing screenshots, follow these steps:

1. Add an e2e test in the `./frontend/src/tests/e2e` directory.
2. Implement a test which performs a visual comparison with `await expect(page).toHaveScreenshot()`.
3. Run the e2e test locally using `npm run test-e2e:snapshots` to generate the screenshots.
4. Run the e2e test locally again using `npm run test-e2e` to validate the test.
5. Add the generated screenshots to Git.
6. Create a PR for your changes.
7. Open the GitHub Actions page and navigate to [Update snapshots](https://github.com/dfinity/nns-dapp/actions/workflows/snapshots.yml).
8. Manually trigger the generation of screenshots for the CI by running the workflow using your PR or branch.

This last step will generate the screenshots for the CI and add them to your PR. You can trigger this job again at any time you make changes, regardless of whether the test itself changes or not.

### Notes

The snapshots used for visual comparisons are saved in `./frontend/snapshots`.

Since the CI runs on Linux machines, the screenshots used for testing purposes are suffixed with `*-linux.png`.

However, most of us are developing locally on MacOS, and the corresponding screenshots are suffixed with `*-darwin.png`. Although we don't necessarily need to commit these screenshots to the repo since they are not used by the continuous integration, we do so for convenience reasons.