# Testing

Some background to understand and write tests for the nns-dapp.

- [Frontend Testing](#frontend-testing)
  - [Running Tests](#running-tests)
  - [Unit Tests](#unit-tests)
  - [Integration Tests](#integration-tests)
  - [Mocks](#mocks)
  - [Test Utils](#test-utils)
  - [Migration to vitest](#migration-to-vitest)
- [Canister Test](#canister-test)
  - [Running Tests](#running-tests-1)
  - [Unit Tests](#unit-tests-1)

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

Test in `src/tests/workfows` are considered more of integration tests. The main goal is to test whole workflows mocking only the API layer.

For example in [CreateSubaccount.spec.ts](./frontend/src/tests/workflows/CreateSubaccount.spec.ts) it renders the Accounts page and performs the actions to create a subaccount.

There are a few rules to consider a test as an integration test:

- Mock **only** the API layer and authStore.
- Set the stores to any value needed to check the flow you're testing.
- No mocking of services, utils, stores, ...
- Do not use CSS classes as selector.
- Expect calls to the API layer.

### Mocks

All the mocks used in different tests are in `frontend/src/tests/mocks`.

### Test Utils

Found in `frontend/src/tests/utils`.

### Migration to vitest

To migrate a test from jest to vitest, aside from moving it between folders, the following changes can be made:

- Replace the prefix `jest.` with `vi.`

- Remove the `jsdom` annotation, as all vitest runs in a simulated browser environment

```
/**
 * @jest-environment jsdom
 */
```

- Replace `jest-mock-extended` with `vitest-mock-extended`

- Replace path `$tests` with `$vitests` in following imports:

  - `$tests/utils/timers.test-utils`
  - `$tests/utils/utils.test-utils`

- In vitest, `requireActual` is replaced by `importActual`, and it also becomes a promisified function

```typescript
// jest
jest.mock("$lib/services/ckbtc-minter.services", () => {
  return {
    ...jest.requireActual("$lib/services/ckbtc-minter.services"),
    loadBtcAddress: jest.fn().mockImplementation(() => undefined),
  };
});

// vitest
vi.mock("$lib/services/ckbtc-minter.services", async () => {
  return {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    ...(await vi.importActual<any>("$lib/services/ckbtc-minter.services")),
    loadBtcAddress: vi.fn().mockImplementation(() => undefined),
  };
});
```

- Replace `jest.Mock` cast with types `Mock`

```typescript
// jest
(registerHardwareWalletProxy as jest.Mock).mockImplementation(async () => {
  // Do nothing test
});

// vitest
import type { Mock } from "vitest";

(registerHardwareWalletProxy as Mock).mockImplementation(async () => {
  // Do nothing test
});
```

- Replace `jest.SpyInstance` with types `SpyInstance`

```typescript
// jest
let spyQueryAccount: jest.SpyInstance;

// vitest
import type {SpyInstance} from "vitest";
let spyQueryAccount: SpyInstance;
```

- [Module mocks](https://vitest.dev/guide/migration.html#module-mocks) require `default` exports with vitest. When not migrated, a common error thrown by the test is the following:

> Error: [vitest] vi.mock("$lib/workers/balances.worker?worker", factory?: () => unknown) is not returning an object. Did you mean to return an object with a "default" key?

```typescript
// jest
jest.mock("$lib/workers/transactions.worker?worker", () => {
  return class TransactionsWorker {
    // Etc.
  };
});

// vitest
vi.mock("$lib/workers/transactions.worker?worker", () => ({
  default: class TransactionsWorker {
    // Etc.
  },
}));
```

- When `ReferenceError` is thrown, it can be linked to mocks that are declared within the test and not at its top. This can often be solved by transforming the `jest.mock` into a `vi.doMock` (instead of `vi.mock`).

- The pattern `await waitFor(expect().toBeNull)` seems to require an explicit arrow function call for vitest, like this: `await waitFor(() => expect().toBeNull())`.

- [done() callback](https://vitest.dev/guide/migration.html#done-callback) is deprecated and should be replaced by promise. It's worth noting that this isn't an issue per sé, but it does trigger a console.log, which is not allowed by our test suite.

```typescript
// jest
it("should work", (done) => {
  done();
});

// vijest
it("should work", () =>
  new Promise<void>((done) => {
    done();
  }));
```

For additional information, if needed, refer to the official guide on [Migrating from Jest](https://vitest.dev/guide/migration.html#migrating-from-jest).

## Canister Test

Tests are found in `rs/backend/src/accounts_store/tests.rs`.

### Running Tests

```bash
$ cargo test
```

### Unit Tests

At the moment we have only unit tests.
