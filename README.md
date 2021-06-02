# Network Nervous System App

Your one-stop shop for all needs NNS

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

1. [Flutter](https://flutter.dev/docs/get-started/install)
2. [Node/NPM](https://nodejs.org/en/) - Recommended `> 14.16.1`
3. [DFX](https://sdk.dfinity.org/docs/index.html) - Recommended `> 0.7.0-beta.6 `
4. `didc` in your `$PATH`: Can be downloaded [here](https://github.com/dfinity/candid/releases).

### Development

Development relies on the presence of a testnet that is setup with the II, governance, ledger, and cycle minting canisters.

We rely on the `xsmallh` testnet. To deploy there, run the following:

```shell
./deploy.sh xsmallh
```

Then run the following command to open the UI:

```shell
open "https://$(dfx canister --no-wallet --network xsmallh id nns_ui).xsmallh.dfinity.network"
```

To work on the UI locally, either use your IDE, or run the following:

```
cd dfinity_wallet
flutter run --no-sound-null-safety --web-port 5021
```

## TODO: Running the tests

Explain how to run the automated tests for this system

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

## Deployment

This can be deployed to another network by passing the `--network` variable in the `dfx deploy` step.

```shell
dfx deploy --network=alpha
```

## Built With

- [DFX](https://sdk.dfinity.org/docs/index.html) - SDK and command line
- [TypeScript](https://www.typescriptlang.org/) - Front-end typings and compilation
- [Browserify](http://browserify.org/) - Used to generate RSS Feeds

## TODO: License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
