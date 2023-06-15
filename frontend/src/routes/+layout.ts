// There is a bug in Rollup that non-deterministically fails to detect cyclic
// dependencies. https://github.com/rollup/plugins/issues/1425
// As a result 'lru-cache' is sometimes wrapped in a require* function and
// sometimes it is not. This makes our build non-deterministic.
// lru-caceh is not itself part of a circular dependency but
// semver/classes/range.js, which depends on lru-cache, is.
// By depending on lru-cache directly from our app, we change the order in which
// modules are analyzed, hopefully avoiding the buggy behavior.
// It probably doesn't matter where we put this import, so I put it as close to
// the root of the app as I could find.
// TODO: Remove when the Rollup issue is fixed.
import "lru-cache";

export const prerender = true;

// TODO: no ssr for local development until https://github.com/dfinity/ic-js/issues/238 solved
export const ssr = import.meta.env.PROD;

export const trailingSlash = "always";

// Polyfill Buffer for development purpose. node_modules/@ledgerhq needs buffer.
// ⚠️ For production build the polyfill needs to be injected with Rollup (see vite.config.ts) because the page might be loaded before the _layout.js which will contains this polyfill
import { Buffer } from "buffer";
globalThis.Buffer = Buffer;
