# Testnet Deployment

To deploy testnets with the NNS state, follow these steps.

### Step 1: Prep for deployment

You must run the script from a builder that has access to the testnets. Either spm34 or spm22 will work.

```
$ ssh -A zh1-spm34.zh1.dfinity.network
```

From the builder, clone into the nns-dapp GitHub repo and checkout the `testnets` branch.

```asciidoc
$ git clone git@github.com:dfinity/nns-dapp.git
$ cd nns-dapp/
$ git checkout testnets
```

You will also need a separate copy of the nns-dapp and the ic repo that will be used to build the required canisters for deployment. For example:

```
$ mkdir $HOME/tmp && cd $HOME/tmp
$ git clone git@github.com:dfinity/nns-dapp.git
$ git clone git@github.com:dfinity/ic.git
```

You will use these two locations later on in the deployment.

### Step 2: Execute Deployment

In the nns-dapp with the testnets branch, cd into the testnets directory and modify the deploy-testnet file with the location of the `tmp` repos and the commits that should be checked out.

```asciidoc
$ cd nns-dapp/testnets
$ vim deploy-testnet
```

You will need to replace the following lines:

```asciidoc
IC_COMMIT=<ic-commit> # master Fri Sep 16
IC_DIR=<path-to-tmp-IC-dir>
ND_COMMIT=<nns-dapp-commit> # release Sep 14
ND_DIR=<path-to-tmp-nns-dapp-dir>
```

**Note**: The commits for the IC must coincide with a nightly build that produces canister WASMs. To test if the commit produced a WASM visit this link:

```
https://download.dfinity.systems/ic/<target-commit>/canisters/sns-governance-canister.wasm.gz
```

To deploy to the testnet, run the following command with the testnet name

```asciidoc
$ ./deploy-testnet --dfx-network <testnet-name>
```
