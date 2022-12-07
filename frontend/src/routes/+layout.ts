export const prerender = true;

// TODO: no ssr for local development until https://github.com/dfinity/ic-js/issues/238 solved
export const ssr = import.meta.env.PROD;

export const trailingSlash = "always";

// Polyfill Buffer for development purpose. node_modules/@ledgerhq needs buffer.
// ⚠️ For production build the polyfill needs to be injected with Rollup (see vite.config.ts) because the page might be loaded before the _layout.js which will contains this polyfill
import { Buffer } from "buffer";
globalThis.Buffer = Buffer;
