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
process.env.REDIRECT_TO_LEGACY = "svelte";
process.env.IDENTITY_SERVICE_URL = "http://localhost:8000/";
process.env.OWN_CANISTER_ID = "qhbym-qaaaa-aaaaa-aaafq-cai";
process.env.GOVERNANCE_CANISTER_ID = "rrkah-fqaaa-aaaaa-aaaaq-cai";
process.env.LEDGER_CANISTER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
process.env.IDENTITY_SERVICE_URL =
  "https://qjdve-lqaaa-aaaaa-aaaeq-cai.nnsdapp.dfinity.network";

// testing-library setup
configure({
  testIdAttribute: "data-tid",
});
