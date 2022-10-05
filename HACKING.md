# Hacking

This document list a couple of useful information to develop the NNS-dapp frontend.

## dapp development

NNS-dapp frontend uses an `.env` file to read various environment information and variables.

The repo itself does **not** contain any such file because the source of truth we are using is `dfx.json`.
That is why we are providing a `./config.sh` script that generate the above environment file automatically.

## Local

To run the dapp against canisters deployed locally on a simulated IC network, proceed as following:

- Deploy the Nns, and optionally Sns, backend canisters locally. The [snsdemo](https://github.com/dfinity/snsdemo) provides command lines and an handy tutorial to achieve such goal
- Once deployed, the canister IDs should be collected the "local" network of `dfx.json` should be updated accordingly
- Run `DFX_NETWORK=local ./config.sh` to populate the `.env` file
- Start `npm run dev` in the `./frontend/` folder to serve the application
- 
## Testnet

The [canister_ids.json] data provides the list of canister IDs available for various test environments.

### Configure

To develop and run locally the dapp against a testnet, proceed as following:

- Copy the [canister_ids.json] to the root of your local project
- Run `DFX_NETWORK=<testnet_name> ./config.sh` to populate the `.env` file
- Start `npm run dev` in the `./frontend/` folder to serve the application

e.g. replace `<testnet_name>` with `small11`

### Requirement

The `dfx` version installed locally should match the one defined in [dfx.json](https://github.com/dfinity/nns-dapp/blob/main/dfx.json). If not, you will have to either upgrade or manually change the version in the local file. In such case, please do not commit the change!

[canister_ids.json]: https://github.com/dfinity/nns-dapp/blob/testnets/testnets/canister_ids.json
[package.json]: https://github.com/dfinity/nns-dapp/blob/main/frontend/package.json
