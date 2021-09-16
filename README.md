# Network Nervous System Dapp

The NNS Dapp is a dapp that provides a user friendly way to interact with the NNS of the Internet Computer. With it, you can:

* Send/receive ICP
* Stake neurons
* Create canisters
* Top up canisters with cycles
* View and vote on NNS proposals

## Official build

The official build should ideally be reproducible, so that independent parties
can validate that we really deploy what we claim to deploy.

We try to achieve some level of reproducibility using a Dockerized build
environment. The following steps _should_ build the official Wasm image

    docker build -t nns-dapp .
    docker run --rm --entrypoint cat nns-dapp /nns-dapp.wasm > nns-dapp.wasm
    sha256sum nns-dapp.wasm

The resulting `nns-dapp.wasm` is ready for deployment as
`qoctq-giaaa-aaaaa-aaaea-cai`, which is the reserved principal for this service.

Our CI also performs these steps; you can compare the SHA256 with the output there, or download the artifact there.

### Software versions

What things you need to install the software and how to install them

- [Flutter](https://flutter.dev/docs/get-started/install) version `2.0.6`
- [Node/NPM](https://nodejs.org/en/) version `>= v14.17.0`
- [DFX](https://sdk.dfinity.org/docs/index.html) version `>= 0.7.0`
- `didc` in your `$PATH`: Can be downloaded [here](https://github.com/dfinity/candid/releases).

### Development

Development relies on the presence of a testnet that is setup with the II, governance, ledger, and cycle minting canisters. We do not yet support fully local development.

To deploy to the testnet, run the following:

```shell
./deploy.sh testnet
```

You can now access the frontend using:

```shell
open "https://$(dfx canister --no-wallet --network testnet id nns-dapp).nnsdapp.dfinity.network"
```

To work on the UI locally, either use your IDE, or run the following:

```
cd frontend/dart
flutter run --no-sound-null-safety --dart-define=DEPLOY_ENV=staging --web-port 5021
```
