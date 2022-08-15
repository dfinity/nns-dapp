import "@testing-library/jest-dom";
import { configure } from "@testing-library/svelte";
// jsdom does not implement TextEncoder
// Polyfill the encoders with node
import { TextDecoder, TextEncoder } from "util";
import { IntersectionObserverPassive } from "./src/tests/mocks/infinitescroll.mock";

global.TextEncoder = TextEncoder;
(global as { TextDecoder: typeof TextDecoder }).TextDecoder = TextDecoder;
(
  global as { IntersectionObserver: typeof IntersectionObserver }
).IntersectionObserver = IntersectionObserverPassive;

// Environment Variables Setup
process.env.IDENTITY_SERVICE_URL = "http://localhost:8000/";
process.env.OWN_CANISTER_ID = "qhbym-qaaaa-aaaaa-aaafq-cai";
process.env.GOVERNANCE_CANISTER_ID = "rrkah-fqaaa-aaaaa-aaaaq-cai";
process.env.LEDGER_CANISTER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
process.env.CYCLES_MINTING_CANISTER_ID = "rkp4c-7iaaa-aaaaa-aaaca-cai";
process.env.IDENTITY_SERVICE_URL =
  "https://qjdve-lqaaa-aaaaa-aaaeq-cai.nnsdapp.dfinity.network";
process.env.WASM_CANISTER_ID = "u7xn3-ciaaa-aaaaa-aaa4a-cai";
process.env.FEATURE_FLAGS = JSON.stringify({
  ENABLE_SNS_NEURONS: true,
  VOTING_UI: "modern"
});

// testing-library setup
configure({
  testIdAttribute: "data-tid",
});
