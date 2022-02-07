import "@testing-library/jest-dom";
// jsdom does not implement TextEncoder
// Polyfill the encoders with node
import { TextDecoder, TextEncoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
