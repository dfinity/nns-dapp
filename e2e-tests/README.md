# end-to-end tests

See `e2e.test.ts` for the actual tests. Follow `test` from `package.json` for
more info.

## Run the tests

First, build the canister:

```bash
# in the repo root
./scripts/docker-build
```

This generates `nns-dapp.wasm`.

Then, deploy the canister:

```bash
# in a shell, start the replica:
dfx start

# in another shell, deploy the canister
# in the repo root
DEPLOY_ENV=nobuild dfx deploy --no-wallet --network local
```

Install all the dependencies for the test suite, and run the tests:

```bash
# in proxy/
npm ci
npm run build

# in e2e-tests/
npm ci
npm run test
```

Finally, shut down the replica by killing the `dfx start` process.

## Run the tests against a testnet

Use the environment variables `NNS_DAPP_URL` and direct wdio command:

```
NNS_DAPP_URL=... npm run wdio
```

We can also write tests that only run on testnet environment.

```
// Skip tests unless running in testnet
let itFn = process.env.NNS_DAPP_URL.includes('localhost') ? xit : it;

itFn("this is a test that runs only in testnet", async () => {
  //...
})
```
