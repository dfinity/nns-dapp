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

Some of the tests will require a specific environment, such as an existing SNS
project. The enviroment that we run against on CI is created by
[.github/workflows/run.yml](https://github.com/dfinity/snsdemo/blob/main/.github/workflows/run.yml)
in ths snsdemo repository. After setting up the enviroment, it creates a
snapshot of the replica state, which is then used for CI by the nns-dapp repo.

You can run locally with such a snapshot by using `scripts/dev-local-state.sh`.
However, on Mac environments, this only seems to work if the snapshot was created
on the same machine.


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
