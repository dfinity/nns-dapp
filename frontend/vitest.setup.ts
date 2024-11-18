import { Crypto as SubtleCrypto } from "@peculiar/webcrypto";
import "@testing-library/jest-dom";
import { configure } from "@testing-library/svelte";
import "fake-indexeddb/auto";
// jsdom does not implement TextEncoder
// Polyfill the encoders with node
import { TextDecoder, TextEncoder } from "util";
import { vi } from "vitest";
import { browser, building } from "./__mocks__/$app/environment";
import {
  afterNavigate,
  beforeNavigate,
  goto,
} from "./__mocks__/$app/navigation";
import { navigating, page } from "./__mocks__/$app/stores";
import { IntersectionObserverPassive } from "./src/tests/mocks/infinitescroll.mock";
import { failTestsThatLogToConsole } from "./src/tests/utils/console.test-utils";
import {
  mockedConstants,
  setDefaultTestConstants,
} from "./src/tests/utils/mockable-constants.test-utils";

// Restore all mocks original behvior before each test.
//
// NOTE: This restores mocks created with vi.spyOn() to their production
// behavior, but returns mocks created on modules with vi.mock() to mocks that
// return undefined. Regardless, it will make sure that each test starts with
// the same behavior for all mocks.
beforeEach(() => {
  vi.restoreAllMocks();
});

// Reset every store before each test.
const resetStoreFunctions = vi.hoisted(() => {
  return [];
});

vi.mock("svelte/store", async (importOriginal) => {
  const svelteStoreModule = await importOriginal();
  return {
    ...svelteStoreModule,
    writable: <T>(initialValue, ...otherArgs) => {
      const store = svelteStoreModule.writable<T>(initialValue, ...otherArgs);
      resetStoreFunctions.push(() => store.set(initialValue));
      return store;
    },
  };
});

beforeEach(() => {
  for (const reset of resetStoreFunctions) {
    reset();
  }
});

// Mock SubtleCrypto to test @dfinity/auth-client
const crypto = new SubtleCrypto();
Object.defineProperty(global, "crypto", {
  value: crypto,
});

global.TextEncoder = TextEncoder;
(global as { TextDecoder: typeof TextDecoder }).TextDecoder = TextDecoder;
(
  global as { IntersectionObserver: typeof IntersectionObserver }
).IntersectionObserver = IntersectionObserverPassive;

// Environment Variables Setup
vi.mock("./src/lib/utils/env-vars.utils.ts", () => ({
  getEnvVars: () => ({
    ckbtcIndexCanisterId: "n5wcd-faaaa-aaaar-qaaea-cai",
    ckbtcLedgerCanisterId: "mxzaz-hqaaa-aaaar-qaada-cai",
    cyclesMintingCanisterId: "rkp4c-7iaaa-aaaaa-aaaca-cai",
    ckethLedgerCanisterId: "ss2fx-dyaaa-aaaar-qacoq-cai",
    ckethIndexCanisterId: "s3zol-vqaaa-aaaar-qacpa-cai",
    dfxNetwork: "testnet",
    featureFlags: JSON.stringify({
      ENABLE_CKBTC: true,
      ENABLE_CKTESTBTC: true,
      DISABLE_IMPORT_TOKEN_VALIDATION_FOR_TESTING: false,
      ENABLE_PERIODIC_FOLLOWING_CONFIRMATION: false,
      ENABLE_NEURON_VISIBILITY: true,
      TEST_FLAG_EDITABLE: true,
      TEST_FLAG_NOT_EDITABLE: true,
    }),
    fetchRootKey: "false",
    host: "https://icp-api.io",
    governanceCanisterId: "rrkah-fqaaa-aaaaa-aaaaq-cai",
    identityServiceUrl: "http://localhost:8000/",
    ledgerCanisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
    indexCanisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
    ownCanisterId: "qhbym-qaaaa-aaaaa-aaafq-cai",
    // Environments without SNS aggregator are valid
    snsAggregatorUrl:
      "https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network",
    wasmCanisterId: "u7xn3-ciaaa-aaaaa-aaa4a-cai",
    tvlCanisterId: "ewh3f-3qaaa-aaaap-aazjq-cai",
  }),
}));

vi.mock("./src/lib/constants/mockable.constants.ts", () => mockedConstants);
setDefaultTestConstants({
  DEV: false,
  FORCE_CALL_STRATEGY: undefined,
  IS_TEST_ENV: true,
  QR_CODE_RENDERED_DEFAULT_STATE: true,
  ENABLE_QR_CODE_READER: false,
  isForceCallStrategy: function () {
    return this.FORCE_CALL_STRATEGY === "query";
  },
  notForceCallStrategy: function () {
    return !this.isForceCallStrategy();
  },
});

failTestsThatLogToConsole();

// Avoid using fetch in tests.
// NOTE: This doesn't seem to work when all tests are run but works when
// individual tests are run. Not sure why. Still it seems better to have it than
// not to have it.
let usedGlobalFetch = false;
beforeEach(() => {
  usedGlobalFetch = false;
});
afterEach(async () => {
  expect(usedGlobalFetch).toBe(false);
});
vi.spyOn(global, "fetch").mockImplementation(() => {
  usedGlobalFetch = true;
  throw new Error("global.fetch is not allowed in tests");
});

// testing-library setup
configure({
  testIdAttribute: "data-tid",
});

vi.mock("$app/environment", () => ({
  browser,
  building,
}));

vi.mock("$app/navigation", () => ({
  goto,
  afterNavigate,
  beforeNavigate,
}));

vi.mock("$app/stores", () => ({
  page,
  navigating,
}));

// Issue: https://github.com/testing-library/svelte-testing-library/issues/206
Object.defineProperty(global, "requestAnimationFrame", {
  value: (fn) => {
    return window.setTimeout(() => fn(Date.now()), 0);
  },
});
