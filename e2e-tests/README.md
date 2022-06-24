# end-to-end tests

See `e2e.test.ts` for the actual tests. Follow `test` from `package.json` for
more info.

## Run the tests

First, deploy to a local replica the required canisters:

```bash
# in root folder
./deploy.sh --network local
```

This will build NNS Dapp and deploy all the necessary canister to your local machine.

Install all the dependencies for the test suite, and run the tests:

```bash
# in e2e-tests/
npm ci
npm run test
```

Finally, shut down the replica by killing the `dfx start` process.

## Run the tests against a testnet

Use the environment variables `NNS_DAPP_URL` and direct wdio command:

```
NNS_DAPP_URL=... npm run test
```
