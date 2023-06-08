# Network Nervous System Dapp

The [NNS front-end Dapp](https://nns.internetcomputer.org/) is a dapp that provides a user friendly way to interact with the NNS of the Internet Computer. With it, you can:

- Send/receive ICP
- Stake neurons
- Participate in the governance of the IC
- Create and top up canisters

The [SNS aggregator](https://3r4gx-wqaaa-aaaaq-aaaia-cai.ic0.app/) is a back-end canister that provides fast, certified data about SNS canisters.  It supports the NNS front-end dapp
under situations of high load.

## Official build

The official build should ideally be reproducible, so that independent parties
can validate that we really deploy what we claim to deploy.

We try to achieve some level of reproducibility using a Dockerized build
environment. The following steps _should_ build the official Wasm image.

### Install tools
#### Mac
* [Brew](https://brew.sh/) is a software installer for Mac.  Please install it as per the official guide:
  ```
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ```
* [Git](https://git-scm.com/) is a distributed version control tool.  Please install it with:
  ```
  brew install git
  ```
* [Docker](https://www.docker.com/) is a container environment.  It lets you build the nns-dapp code in a sandbox, fairly reliably, and without you having to install a lot of custom tools that you may not trust.  Please use [one of the official installers](https://docs.docker.com/get-docker/).
* [Docker buildx](https://github.com/docker/buildx) is an extension that makes it easier to compile under docker.  `buildx` is included in the standard docker installer for Mac desktops.  If you have installed docker for an os-x server, please follow [the official guide](https://docs.docker.com/build/install-buildx/).
* [Rosetta]() allows Mac M1 and M2 processors to run programs that use the AMD64 instruction set.  If you have an M1 or M2 CPU, please:
  * Install rosetta:
    ```
    softwareupdate --install-rosetta
    ```
  * Restart your laptop.

#### Ubuntu Linux
* [Advanced Packaging Manager](https://ubuntu.com/server/docs/package-management), also known as `apt`, is the recommended package manager for Ubuntu.  Please ensure that the `apt` package index is up to date:
  ```
  apt-get update
  ```
* [Git](https://git-scm.com/) is a distributed version control tool.  Please install it with:
  ```
  apt-get install git
  ```
* [Docker](https://www.docker.com/) is a container environment.  It lets you build the nns-dapp code in a sandbox, fairly reliably, and without you having to install a lot of custom tools that you may not trust.  Please use [one of the official installers](https://docs.docker.com/get-docker/).
* [Docker buildx](https://github.com/docker/buildx) is an extension that makes it easier to compile under docker.  `buildx` is included in recent docker releases.  You can check whether it is installed with:
  ```
  $ docker build --help

  Usage:  docker buildx build [OPTIONS] PATH | URL | -
  ...
  ```
  If you do not have buildx installed, please follow [the official guide](https://docs.docker.com/build/install-buildx/).  In particular, to install version `0.10.4` on a x86-64 Linux machine:
  ```sh
  wget https://github.com/docker/buildx/releases/download/v0.10.4/buildx-v0.10.4.linux-amd64
  mv buildx-v0.10.4.linux-amd64 docker-buildx
  chmod +x docker-buildx
  mkdir -p $HOME/.docker/cli-plugins/
  mv docker-buildx $HOME/.docker/cli-plugins/
  ```

### Build
Afterwards you can simply build the container with the following

```sh
./scripts/docker-build
sha256sum nns-dapp.wasm
```

The resulting `nns-dapp.wasm` is ready for deployment as
`qoctq-giaaa-aaaaa-aaaea-cai`, which is the reserved principal for this service.

Our CI also performs these steps; you can compare the SHA256 with the output there, or download the artifact there.

## Development

Development relies on the presence of a testnet that is setup with the II, governance, ledger, and cycle minting canisters. Fully local development is unfortunately not yet supported and the tools for setting up a testnet are not yet available publicly. It is on the roadmap to make these tools available publicly for developers.

When deploying the governance, ledger, and cycle minting canisters to the testnet you must first create a file called `test-accounts.json` in the root of the IC repo whose contents is:

```json
{
  "init_ledger_accounts": [
    "5b315d2f6702cb3a27d826161797d7b2c2e131cd312aece51d4d5574d1247087"
  ]
}
```

Then run the following from the root directory of the IC repo:

```sh
./testnet/tools/icos_deploy.sh --git-revision <commit_id> nnsdapp --ansible-args "-e @$PWD/test-accounts.json"
```

To deploy the NNS Dapp canister to the testnet, run the following:

```sh
./deploy.sh testnet
```

You can now access the frontend using:

```sh
open "https://$(dfx canister --network testnet id nns-dapp).nnsdapp.dfinity.network"
```

To work on the UI locally, either use your IDE, or run the following:

```sh
cd frontend
npm ci
npm run dev
```

## Links

Some useful links:

- See the [HACKING](/HACKING.md) document for some information about local development

Other information resources:

- [The Network Nervous System: Governing the Internet Computer](https://medium.com/dfinity/the-network-nervous-system-governing-the-internet-computer-1d176605d66a)
- [The Internet Computer’s NNS Front-End Dapp Is Now Open Source](https://medium.com/dfinity/the-internet-computers-nns-front-end-dapp-is-now-open-source-3925edc21c49)
- [How to Deploy Your First Canister Smart Contract Using the NNS Dapp](https://medium.com/dfinity/how-to-deploy-your-first-canister-using-the-nns-dapp-c8b75e01a05b)
- [The Community-Led Governance of the Internet Computer](https://medium.com/dfinity/the-community-led-governance-of-the-internet-computer-b863cd2975ba)
- [Earn Substantial Voting Rewards by Staking in the Network Nervous System](https://medium.com/dfinity/earn-substantial-voting-rewards-by-staking-in-the-network-nervous-system-7eb5cf988182)
- [Get Started Using the NNS Front-End Dapp and ICP Wallet on the Internet Computer](https://medium.com/dfinity/getting-started-on-the-internet-computers-network-nervous-system-app-wallet-61ecf111ea11)
