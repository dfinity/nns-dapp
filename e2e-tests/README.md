# end-to-end tests

See `e2e.test.ts` for the actual tests. Follow `test` from `package.json` for
more info.

## Run the tests locally

**NOTE: Most commands are executed from the root folder.**

### Requirements

* dfx version same as in dfx.json.

### Start replica

Start a dfx replica:

```bash
# in root folder
dfx start --clean

# run replica in the background with
dfx start --clean --background
```

### Download and install NNS canisters

Install dfx version `0.12.0-snsdemo.4` and set it in `dfx.json`.

```bash
dfx nns install
```

### Deploy NNS Dapp

Install NNS Dapp in the local replica.

```bash
# in root folder
./deploy.sh --nns-dapp local
```

### Setup e2e tests

Install dependencies.

```bash
# In this folder
npm ci
```

Create environment variables in e2e folder

```bash
# in root folder
DFX_NETWORK=local ENV_OUTPUT_FILE=./e2e-tests/.env ./config.sh
```

**Choose browser:**

By default, tests will be executed (or tried to) in Firefox and Chrome.

_Firefox tests are still shaky at the moment._

Recommendation: Use only chrome:

```bash
# It doesn't matter the folder
export WDIO_BROWSER=chrome
```

### Populate

First e2e is also used to populate the nns dapp:

```bash
# in root folder
./deploy.sh --populate local
```

**PENDING: Setting cycles exchange is not working yet. Therefore, the related tests are skipped.**

This command sets the cycles exchange rate and the list of subnets CMC is authorized to create canisters in.

Both through proposals which are needed for the e2e tests.

Then it executes the e2e test in "user-N01-neuron-created.e2e.ts".

Therefore, if this works your setup is ready.

### Execute e2e tests

All the e2e tests can be run with:

```bash
# In this folder
npm run test
```

You can specify which test you want to run:

```bash
# In this folder
npm run test -- --spec "./specs/user-N01-neuron-created.e2e.ts"
```

**Note: If you want to see the e2e in action, go to [the wdio config file](./wdio.conf.ts) and remove "headless" from `goog:chromeOptions`.**

### Stop Local Replica

```bash
# In root folder
dfx stop
```

Or close the execution with "command + C"

## Run the tests against a testnet

Build the environment file for that testnet:

```bash
# In root folder
DFX_NETWORK=staging ENV_OUTPUT_FILE=./e2e-tests/.env ./config.sh
```

Run the test:

```bash
# In this folder
npm run test
# or
npm run test -- --spec "./specs/user-N01-neuron-created.e2e.ts"
```
