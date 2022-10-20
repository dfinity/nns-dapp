# Hacking

This document list a couple of useful information to develop the NNS-dapp frontend.

## dapp development

NNS-dapp frontend uses an `.env` file to read various environment information and variables.

The repo itself does **not** contain any such file because the source of truth we are using is `dfx.json`.
That is why we are providing a `./config.sh` script that generate the above environment file automatically.

## Local NNS Dapp Frontend

Local development of the Frontend of the NNS Dapp.

### (Temporary) Requirements

**NOTE: Update with new DFX version release.**

Install DFX version `0.12.0-snsdemo.5`:

```bash
export DFX_VERSION="0.12.0-snsdemo.5"
dfx --version | grep "$DFX_VERSION" || sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
dfx cache install
```

You should be able to have access to the `nns` command:

```bash
dfx nns install --help
```

Make sure that your `$HOME/.config/dfx/networks.json` has the following configuration for the "local" network:

```bash
{
  "local": {
    "bind": "127.0.0.1:8080",
    "type": "ephemeral",
    "replica": {
      "subnet_type": "system"
    }
  }
}
```

### (Temporary) Steps

**NOTE: Update with new DFX version release.**

To run the dapp against canisters deployed locally on a simulated IC network, proceed as following:

### Change dfx version

This "temporary" way to develop locally uses a new dfx version not yet officially published and not tested for deployment.

Therefore, the `dfx.json` has not yet been updated accordingly.

You need to change the version before developing locally in `dfx.json`:

```json
{
  "dfx": "0.12.0-snsdemo.5",
  //...
```

**IMPORTANT: DO NOT COMMIT THESE CHANGE.**

### Start dfx

```bash
dfx start
```

If you want to clean the local replica state:

```bash
dfx start --clean
```

### Install NNS

In case you start with a clean replica:

```bash
dfx nns install
```

### Create local configuration file

```bash
DFX_NETWORK=local ./config.sh
```

### Run Frontend Local Server

If you haven't installed the frontend:

```bash
cd frontend
npm ci
```

Start development server:

```bash
npm run dev
```

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

## Requirements

The `dfx` version installed locally should match the one defined in [dfx.json](https://github.com/dfinity/nns-dapp/blob/main/dfx.json). If not, you will have to either upgrade or manually change the version in the local file. In such case, please do not commit the change!

[canister_ids.json]: https://github.com/dfinity/nns-dapp/blob/testnets/testnets/canister_ids.json
[package.json]: https://github.com/dfinity/nns-dapp/blob/main/frontend/package.json
