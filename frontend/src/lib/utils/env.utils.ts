import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { NNS_IC_ORG_ALTERNATIVE_ORIGIN } from "$lib/constants/origin.constants";

/**
 * To be use when Rollup fails to resolve import "$app/environment". This can happen because we manually define chunks and SvelteKit is not entirely resilient to bundler reordering.
 * Example of SvelteKit issue: https://github.com/sveltejs/kit/pull/9808
 *
 * Stacktrace of the `npm run build` error that can lead to use `isBrowser` instead of `browser`:
 *
 * [vite:worker] [vite]: Rollup failed to resolve import "__sveltekit/environment" from "/.../nns-dapp/frontend/node_modules/@sveltejs/kit/src/runtime/app/environment.js".
 * This is most likely unintended because it can break your application at runtime.
 * If you do want to externalize this module explicitly add it to `build.rollupOptions.external`
 */
export const isBrowser = typeof window !== "undefined";

export const isNnsAlternativeOrigin = (): boolean => {
  const {
    location: { origin },
  } = window;

  return origin === NNS_IC_ORG_ALTERNATIVE_ORIGIN;
};

/**
 * Sets `raw` in the URL to avoid CORS issues.
 *
 * Used for local development only.
 *
 * @param urlString
 * @returns url with `raw` added
 */
export const addRawToUrl = (urlString: string): string => {
  const hasTrailingSlash = urlString.endsWith("/");
  const url = new URL(urlString);

  const [canisterId, ...rest] = url.host.split(".");

  const newHost = [canisterId, "raw", ...rest].join(".");

  url.host = newHost;

  return hasTrailingSlash ? url.toString() : url.toString().slice(0, -1);
};

export const isLocalhost = (hostname: string) =>
  hostname.includes("localhost") || hostname.includes("127.0.0.1");

export const isForceCallStrategy = (): boolean =>
  FORCE_CALL_STRATEGY === "query";

export const notForceCallStrategy = (): boolean => !isForceCallStrategy();
