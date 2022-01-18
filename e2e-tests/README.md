# end-to-end tests

See `e2e.test.ts` for the actual tests. Follow `test` from `package.json` for
more info.


## Run the tests

(every snippet is run from the root)

First, build the canister:

``` bash
./scripts/docker-build
```

This generates `target/wasm32-unknown-unknown/release/nns-dapp-opt.wasm` and
`assets.tar.xz`.

Then, deploy the canister:

``` bash
# in a shell, start the replica:
dfx start

# in another shell, deploy the canister
DEPLOY_ENV=nobuild dfx deploy --no-wallet --network local
```


Install all the dependencies for the proxy, and run the proxy:

``` bash
cd proxy
npm install
npm run start
```

Install all the dependencies for the test suite, and run the tests:

```
cd e2e-tests
npm install
npm run install-webdrivers
npm run test
```

Finally, shut down the replica by killing the `dfx start process`.
