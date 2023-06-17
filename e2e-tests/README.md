# end-to-end tests

See `e2e.test.ts` for the actual tests. Follow `test` from `package.json` for
more info.

## Run the tests locally

**NOTE: Most commands are executed from the root folder.**

### Requirements

- dfx version same as in dfx.json.

### Setup local environment

From the root directory.

```bash
./scripts/dfx-nns-deploy-custom
```

This script starts a local replica in the background and installs all needed canisters.

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

### Execute e2e tests

All the e2e tests can be run with:

```bash
# In this folder
npm run test
```

By default the test will run in the background. If you want to see the test run
in the browser, set environment variable `WDIO_VIEW` to anything other than
`headless`:

```bash
WDIO_VIEW=yes npm run test
```

**PENDING: Creating proposals is not working yet. Therefore, the related tests are skipped.**

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
DFX_NETWORK=small12 ENV_OUTPUT_FILE=./e2e-tests/.env ./config.sh
```

Run the test:

```bash
# In this folder
npm run test
# or
npm run test -- --spec "./specs/user-N01-neuron-created.e2e.ts"
```
