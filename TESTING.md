# Testing

Some background to understand and write tests for the nns-dapp.

## Frontend Testing

Tests are in `./frontend/src/tests`.

### Running Tests

```bash
$ cd frontend
$ npm test
```

### Unit Tests

Tests in `frontend/src/tests/lib` and `frontend/src/tests/routes` are the unit tests for each component or functions we have.

A simple component test example can be [AccountBadge.spec.ts](./frontend/src/tests/lib/components/accounts/AccountBadge.spec.ts).

On the other hand, check [accounts.utils.spec](./frontend/src/tests/lib/utils/accounts.utils.spec.ts) for function testing.

### Integration Tests

Test in `src/tests/workfows` are considered more of integration tests. The main goal is to test whole workflows mocking only the api layer.

For example in [CreateSubaccount.spec.ts](./frontend/src/tests/workflows/CreateSubaccount.spec.ts) it renders the Accounts page and performs the actions to create a subaccount.

There are a few rules to consider a test as an integration test:

- Mock **only** the api layer and authStore.
- Set the stores to any value needed to check the flow you're testing.
- No mocking of services, utils, stores, ...
- Do not use CSS classes as selector.
- Expect calls to the api layer.

### Mocks

All the mocks used in different tests are in `frontend/src/tests/mocks`.

### Test Utils

Found in `frontend/src/tests/utils`.

## Canister Test

Tests are found in `rs/backend/src/accounts_store/tests.rs`.

### Running Tests

```bash
$ cargo test
```

### Unit Tests

At the moment we have only unit tests.
