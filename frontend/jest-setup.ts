import { Crypto as SubtleCrypto } from "@peculiar/webcrypto";
import "@testing-library/jest-dom";
import { configure } from "@testing-library/svelte";
// jsdom does not implement TextEncoder
// Polyfill the encoders with node
import { TextDecoder, TextEncoder } from "util";
import { IntersectionObserverPassive } from "./src/tests/mocks/infinitescroll.mock";
import localStorageMock from "./src/tests/mocks/local-storage.mock";
import { failTestsThatLogToConsole } from "./src/tests/utils/console.test-utils";
import {
  mockedConstants,
  setDefaultTestConstants,
} from "./src/tests/utils/mockable-constants.test-utils";

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
jest.mock("./src/lib/utils/env-vars.utils.ts", () => ({
  getEnvVars: () => ({
    ckbtcIndexCanisterId: "n5wcd-faaaa-aaaar-qaaea-cai",
    ckbtcLedgerCanisterId: "mxzaz-hqaaa-aaaar-qaada-cai",
    cyclesMintingCanisterId: "rkp4c-7iaaa-aaaaa-aaaca-cai",
    dfxNetwork: "testnet",
    featureFlags: JSON.stringify({
      ENABLE_CKBTC: true,
      ENABLE_CKTESTBTC: true,
      ENABLE_ICP_ICRC: false,
      ENABLE_NEURON_SETTINGS: true,
      ENABLE_INSTANT_UNLOCK: true,
      ENABLE_SNS_AGGREGATOR_STORE: false,
      ENABLE_DISBURSE_MATURITY: true,
      TEST_FLAG_EDITABLE: true,
      TEST_FLAG_NOT_EDITABLE: true,
    }),
    fetchRootKey: "false",
    host: "https://icp-api.io",
    governanceCanisterId: "rrkah-fqaaa-aaaaa-aaaaq-cai",
    identityServiceUrl: "http://localhost:8000/",
    ledgerCanisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
    ownCanisterId: "qhbym-qaaaa-aaaaa-aaafq-cai",
    // Environments without SNS aggregator are valid
    snsAggregatorUrl:
      "https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network",
    wasmCanisterId: "u7xn3-ciaaa-aaaaa-aaa4a-cai",
    tvlCanisterId: "ewh3f-3qaaa-aaaap-aazjq-cai",
  }),
}));

jest.mock("./src/lib/constants/mockable.constants.ts", () => mockedConstants);
setDefaultTestConstants({
  DEV: false,
  ENABLE_METRICS: false,
  FORCE_CALL_STRATEGY: undefined,
  IS_TEST_ENV: true,
  QR_CODE_RENDERED_DEFAULT_STATE: true,
  ENABLE_QR_CODE_READER: false,
});

global.localStorage = localStorageMock;

failTestsThatLogToConsole();

// testing-library setup
configure({
  testIdAttribute: "data-tid",
});
