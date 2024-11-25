import { NNS_IC_ORG_ALTERNATIVE_ORIGINS } from "$lib/constants/origin.constants";

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

  return NNS_IC_ORG_ALTERNATIVE_ORIGINS.includes(origin);
};

// Given the used strategy and whether the current call is certified, returns
// whether this is the last call.
//
// If the strategy is "query_and_update", the last call is the certied one.
// Otherwise there is only a single call and the current call is the last one.
export const isLastCall = ({
  strategy,
  certified,
}: {
  strategy: "query_and_update" | "query" | "update";
  certified: boolean;
}): boolean => certified || strategy !== "query_and_update";
