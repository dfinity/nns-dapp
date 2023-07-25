## Official build

The official build should ideally be reproducible, so that independent parties
can validate that we really deploy what we claim to deploy.

We try to achieve some level of reproducibility using a Dockerized build
environment. The following steps _should_ build the official Wasm image.

### Install tools

#### Mac

- [Brew](https://brew.sh/) is a software installer for Mac. Please install it as per the official guide:
  ```sh
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ```
- [Bash](https://www.gnu.org/software/bash/) is a popular shell that we use to execute scripts.
    - Check which version of bash you have installed:
      ```sh
      bash --version
      ```
    - If you have version 5 or newer, your installation is up to date. If you have an old version, such as 3, [please upgrade](https://itnext.io/upgrading-bash-on-macos-7138bd1066ba).
- [Git](https://git-scm.com/) is a distributed version control tool. Please install it with:
  ```sh
  brew install git
  ```
- [Docker](https://www.docker.com/) is a container environment. It lets you build the nns-dapp code in a sandbox, fairly reliably, and without you having to install a lot of custom tools that you may not trust. Please use [one of the official installers](https://docs.docker.com/get-docker/).
- [Docker buildx](https://github.com/docker/buildx) is an extension that makes it easier to compile under docker. `buildx` is included in the standard docker installer for Mac desktops. If you have installed docker for an os-x server, please follow [the official guide](https://docs.docker.com/build/install-buildx/).
- [Rosetta]() allows Mac M1 and M2 processors to run programs that use the AMD64 instruction set. If you have an M1 or M2 CPU, please:
    - Install rosetta:
      ```sh
      softwareupdate --install-rosetta
      ```
    - Restart your laptop.

#### Ubuntu Linux

- [Advanced Packaging Manager](https://ubuntu.com/server/docs/package-management), also known as `apt`, is the recommended package manager for Ubuntu. Please ensure that the `apt` package index is up to date:
  ```sh
  apt-get update
  ```
- [Git](https://git-scm.com/) is a distributed version control tool. Please install it with:
  ```sh
  apt-get install git
  ```
- [Docker](https://www.docker.com/) is a container environment. It lets you build the nns-dapp code in a sandbox, fairly reliably, and without you having to install a lot of custom tools that you may not trust. Please use [one of the official installers](https://docs.docker.com/get-docker/).
- [Docker buildx](https://github.com/docker/buildx) is an extension that makes it easier to compile under docker. `buildx` is included in recent docker releases. You can check whether it is installed with:

  ```sh
  $ docker build --help

  Usage:  docker buildx build [OPTIONS] PATH | URL | -
  ...
  ```

  If you do not have buildx installed, please follow [the official guide](https://docs.docker.com/build/install-buildx/). In particular, to install version `0.10.4` on a x86-64 Linux machine:

  ```sh
  wget https://github.com/docker/buildx/releases/download/v0.10.4/buildx-v0.10.4.linux-amd64
  mv buildx-v0.10.4.linux-amd64 docker-buildx
  chmod +x docker-buildx
  mkdir -p $HOME/.docker/cli-plugins/
  mv docker-buildx $HOME/.docker/cli-plugins/
  ```

### Build

When you have the tools installed, you can build the container with:

- Get the code
  ```sh
  git clone https://github.com/dfinity/nns-dapp.git && cd nns-dapp
  ```
- If you would like to build a specific version, e.g. the commit for a specific proposal, please check it out:
  ```sh
  git checkout THE_COMMIT
  ```
- Verify that docker is running. If not, please start it.
    - Mac: Press cmd+space and enter docker
    - Ubuntu: `pgrep docker || sudo systemctl start docker`
- Now you can build:
  ```sh
  ./scripts/docker-build
  ```
- You can verify that you have the same output as another user with:
  ```sh
  sha256sum nns-dapp.wasm.gz
  ```

The resulting `nns-dapp.wasm.gz` is ready for deployment as
`qoctq-giaaa-aaaaa-aaaea-cai`, which is the reserved principal for this service.

Our CI also performs these steps; you can compare the SHA256 with the output there, or download the artifact from [a release](https://github.com/dfinity/nns-dapp/releases?q=proposal&expanded=true).

TODO: When we make a proposal, we should have a corresponding release that voters can download. E.g. https://github.com/dfinity/nns-dapp/releases/tag/release-candidate exists but it doesn't have build artefacts.

### Build flavors
The build creates several different `nns-dapp` and `sns_aggregator` wasms.  These builds target specific use cases:

| Flavor | Description | |
| --- | --- | :---: |
| Production | This is the production build deployed to https://nns.ic0.app |
| Dev | This is a build for testing integration with third party canisters.  If you wish to include `nns-dapp` or the `sns_aggregator` in your CI, this build is designed to make your testing easy and convenient. |
| Test | This is a build for testing internal functionality.  If you are changing `nns-dapp` or `sns_aggregator` functionality and need to access or modify the internal state of the nns-dapp to test, this is the build for you. |
| Noassets | This is a build of the nns-dapp that does not include web assets.  This reduces the size of the wasm, which may be convenient in some test scenarios. Note that web assets can be uploaded to the nns-dapp after deployment by the canister controller. |

TODO: Document how to make the `sns_aggregator` collect data quickly.

TODO: Document how to create accounts in the nns-dapp.

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
