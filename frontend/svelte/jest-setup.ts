import "@testing-library/jest-dom";
// jsdom does not implement TextEncoder
// Polyfill the encoders with node
import { TextDecoder, TextEncoder } from "util";
import { IntersectionObserverPassive } from "./src/tests/mocks/infinitescroll.mock";

global.TextEncoder = TextEncoder;
// @ts-ignore: test setup
global.TextDecoder = TextDecoder;
// @ts-ignore: test setup
global.IntersectionObserver = IntersectionObserverPassive;

// Environment Variables Setup
process.env.REDIRECT_TO_LEGACY = "never";
process.env.IDENTITY_SERVICE_URL = "http://localhost:8000/";
process.env.OWN_CANISTER_ID = "qhbym-qaaaa-aaaaa-aaafq-cai";
process.env.GOVERNANCE_CANISTER_ID = "rrkah-fqaaa-aaaaa-aaaaq-cai";
process.env.LEDGER_CANISTER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
process.env.IDENTITY_SERVICE_URL =
  "https://qjdve-lqaaa-aaaaa-aaaeq-cai.nnsdapp.dfinity.network";
