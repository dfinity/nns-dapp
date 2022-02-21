import "@testing-library/jest-dom";
// jsdom does not implement TextEncoder
// Polyfill the encoders with node
import { TextDecoder, TextEncoder } from "util";
import { IntersectionObserverPassive } from "./src/tests/mocks/infinitescroll.mock";

// Global Mocks
// Needed for HttpAgent
global.fetch = jest.fn();
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// @ts-ignore
global.IntersectionObserver = IntersectionObserverPassive;
