import "@testing-library/jest-dom";

// jsdom does not implement TextEncoder
// Polyfill the encoders with node
import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
