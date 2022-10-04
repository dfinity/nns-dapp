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

global.localStorage = localStorageMock;

// testing-library setup
configure({
  testIdAttribute: "data-tid",
});

const DOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("<!DOCTYPE html>");
global.DOMPurify = DOMPurify(window);
