import "@testing-library/jest-dom";
import { configure } from "@testing-library/svelte";
// jsdom does not implement TextEncoder
// Polyfill the encoders with node
import { TextDecoder, TextEncoder } from "util";
import { IntersectionObserverPassive } from "./src/tests/mocks/infinitescroll.mock";
import localStorageMock from "./src/tests/mocks/local-storage.mock";

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
  OWN_CANISTER_ID: "qhbym-qaaaa-aaaaa-aaafq-cai",
  LEDGER_CANISTER_ID: "ryjl3-tyaaa-aaaaa-aaaba-cai",
  GOVERNANCE_CANISTER_ID: "rrkah-fqaaa-aaaaa-aaaaq-cai",
  CYCLES_MINTING_CANISTER_ID: "rkp4c-7iaaa-aaaaa-aaaca-cai",
}));

jest.mock("./src/lib/constants/environment.constants.ts", () => ({
  DFX_NETWORK: "testnet",
  HOST: "https://ic0.app",
  DEV: false,
  FETCH_ROOT_KEY: false,
  WASM_CANISTER_ID: "u7xn3-ciaaa-aaaaa-aaa4a-cai",
  ENABLE_SNS: true,
  VOTING_UI: "modern",
}));

global.localStorage = localStorageMock;

// testing-library setup
configure({
  testIdAttribute: "data-tid",
});

const DOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("<!DOCTYPE html>");
global.DOMPurify = DOMPurify(window);
