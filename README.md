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

### Deploying

Locally

```shell
dfx start --clean [--background]
./deploy.sh local
```

To a testnet (e.g. `xsmallh`):

```shell
./deploy.sh xsmallh
```

Open the front-end asset canister. The following command will give you a URL to open locally.

```
echo " $(dfx config networks.local.bind)/?canisterId=$(dfx canister id nns_ui_assets)"
```
End with an example of getting some data out of the system or using it for a little demo

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

## Testing

3 settings need to be changed in order to test this locally pointing to the testnet.
You can find them by searching for 'TEST CONFIG' and switching which value is commented out.
This is a terrible way of doing it, I'll fix this next week.

## TODO: License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
