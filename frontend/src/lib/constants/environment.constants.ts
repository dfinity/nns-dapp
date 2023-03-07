import { addRawToUrl } from "$lib/utils/env.utils";

export const DFX_NETWORK = import.meta.env.VITE_DFX_NETWORK;
export const HOST = import.meta.env.VITE_HOST as string;
export const DEV = import.meta.env.DEV;
export const FETCH_ROOT_KEY: boolean =
  import.meta.env.VITE_FETCH_ROOT_KEY === "true";

export const HOST_IC0_APP = "https://ic0.app";

const snsAggregatorUrlEnv = import.meta.env
  .VITE_AGGREGATOR_CANISTER_URL as string;
const snsAggregatorUrl = (url: string) => {
  try {
    const { hostname } = new URL(url);
    if (["localhost", "127.0.0.1"].includes(hostname)) {
      return url;
    }

    if (DEV) {
      return addRawToUrl(url);
    }

    return url;
  } catch (e) {
    console.error(`Invalid URL for SNS aggregator: ${url}`, e);
    return undefined;
  }
};

/**
 * If you are on a different domain from the canister that you are calling, the service worker will not be loaded for that domain.
 * If the service worker is not loaded then it will make a request to the boundary node directly which will fail CORS.
 *
 * Therefore, we add `raw` to the URL to avoid CORS issues in local development.
 */
export const SNS_AGGREGATOR_CANISTER_URL: string | undefined =
  snsAggregatorUrl(snsAggregatorUrlEnv);

export interface FeatureFlags<T> {
  ENABLE_SNS_2: T;
  ENABLE_SNS_VOTING: T;
  ENABLE_SNS_AGGREGATOR: T;
  ENABLE_CKBTC: T;
  ENABLE_CKTESTBTC: T;
  // Used only in tests and set up in jest-setup.ts
  TEST_FLAG_EDITABLE: T;
  TEST_FLAG_NOT_EDITABLE: T;
}

export type FeatureKey = keyof FeatureFlags<boolean>;

/**
 * DO NOT USE DIRECTLY
 *
 * @see feature-flags.store.ts to use feature flags
 */
export const FEATURE_FLAG_ENVIRONMENT: FeatureFlags<boolean> = JSON.parse(
  import.meta.env.VITE_FEATURE_FLAGS.replace(/\\"/g, '"') ??
    '{"ENABLE_SNS_2":false, "ENABLE_SNS_VOTING": false, "ENABLE_SNS_AGGREGATOR": true, "ENABLE_CKBTC": true, "ENABLE_CKTESTBTC": false}'
);

export const IS_TESTNET: boolean =
  DFX_NETWORK !== "mainnet" &&
  FETCH_ROOT_KEY === true &&
  !(HOST.includes(".icp-api.io") || HOST.includes(".ic0.app"));

// Disable TVL or transaction rate warning locally because that information is not crucial when we develop
export const ENABLE_METRICS = !DEV;

export const FORCE_CALL_STRATEGY: "query" | undefined = undefined;
