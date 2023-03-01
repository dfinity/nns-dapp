import { Principal } from "@dfinity/principal";
import { Crypto as SubtleCrypto } from "@peculiar/webcrypto";
import "@testing-library/jest-dom";
import { configure } from "@testing-library/svelte";
// jsdom does not implement TextEncoder
// Polyfill the encoders with node
import { TextDecoder, TextEncoder } from "util";
import { IntersectionObserverPassive } from "./src/tests/mocks/infinitescroll.mock";
import localStorageMock from "./src/tests/mocks/local-storage.mock";
import { failTestsThatLogToConsole } from "./src/tests/utils/console.test-utils";

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
jest.mock("./src/lib/constants/identity.constants.ts", () => ({
  IDENTITY_SERVICE_URL: "http://localhost:8000/",
  AUTH_SESSION_DURATION: BigInt(30 * 60 * 1_000_000_000),
}));

jest.mock("./src/lib/constants/canister-ids.constants.ts", () => ({
  OWN_CANISTER_ID_TEXT: "qhbym-qaaaa-aaaaa-aaafq-cai",
  OWN_CANISTER_ID: Principal.fromText("qhbym-qaaaa-aaaaa-aaafq-cai"),
  LEDGER_CANISTER_ID: Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"),
  GOVERNANCE_CANISTER_ID: Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai"),
  CYCLES_MINTING_CANISTER_ID: Principal.fromText("rkp4c-7iaaa-aaaaa-aaaca-cai"),
  WASM_CANISTER_ID: "u7xn3-ciaaa-aaaaa-aaa4a-cai",
  CKBTC_MINTER_CANISTER_ID: Principal.fromText("q3fc5-haaaa-aaaaa-aaahq-cai"),
  CKBTC_LEDGER_CANISTER_ID: Principal.fromText("mc6ru-gyaaa-aaaar-qaaaq-cai"),
  CKBTC_INDEX_CANISTER_ID: Principal.fromText("si2b5-pyaaa-aaaaa-aaaja-cai"),
  CKBTC_UNIVERSE_CANISTER_ID: Principal.fromText("mc6ru-gyaaa-aaaar-qaaaq-cai"),
  TVL_CANISTER_ID: Principal.fromText("ewh3f-3qaaa-aaaap-aazjq-cai"),
}));

jest.mock("./src/lib/constants/environment.constants.ts", () => ({
  DFX_NETWORK: "testnet",
  HOST: "https://icp-api.io",
  DEV: false,
  FETCH_ROOT_KEY: false,
  FEATURE_FLAG_ENVIRONMENT: {
    ENABLE_SNS_2: true,
    ENABLE_SNS_VOTING: true,
    ENABLE_SNS_AGGREGATOR: true,
    ENABLE_CKBTC_LEDGER: true,
    ENABLE_CKBTC_MINTER: true,
    TEST_FLAG_EDITABLE: true,
    TEST_FLAG_NOT_EDITABLE: true,
  },
  SNS_AGGREGATOR_CANISTER_URL:
    "https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network",
  STAKE_MATURITY: true,
  ENABLE_METRICS: false,
  FORCE_CALL_STRATEGY: undefined,
}));

global.localStorage = localStorageMock;

failTestsThatLogToConsole();

// testing-library setup
configure({
  testIdAttribute: "data-tid",
});
