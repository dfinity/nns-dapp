export const prerender = true;
export const ssr = false;

// Polyfill Buffer for the window object
import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;