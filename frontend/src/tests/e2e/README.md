# Running end-to-end tests

If you have a frontend running at `http://localhost:5173`, you can run
end-to-end tests against it by running

```
npm run test-e2e
```

from the `frontend/` directory of this repo.

To run an individual test, you can do something like

```
npm run test-e2e -- account
```

This will run only the e2e tests which have `account` in the filename.

# Environment

The tests run against the local icp-cli network with the nns-dapp build under
test. See the [Local](../../../../HACKING.md#local) section of HACKING.md. On
CI, `.github/actions/test-e2e/action.yml` starts the network and installs the
wasms.

To run the tests locally against the installed nns-dapp canister:

```
export PLAYWRIGHT_BASE_URL="$(../scripts/dfx-canister-url --network local nns-dapp)"
npm run test-e2e
```

Some tests are skipped, because they need an SNS project or ckBTC, which the
local network does not have.

# Debugging

If you run an end-to-end test locally, you can see what it does by running
headed:

```
npm run test-e2e -- --headed
```

You can also see what happened in a failed test by running

```
npx playwright show-report
```

after it failed. It will show a screenshot of the moment it failed and a trace
with a lot of screenshots and information about what happened during the test.

If an end-to-end test failed on CI, you can download and extract
`playwright-failure-results.zip` from GitHub and then use the report inside it
with `playwright show-report`:

```
npx playwright show-report ~/Downloads/playwright-failure-results/playwright-report/
```
