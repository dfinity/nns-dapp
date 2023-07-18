import { getEnvVars } from "$lib/utils/env-vars.utils";
import { addRawToUrl, isBrowser, isLocalhost } from "$lib/utils/env.utils";

const envVars = getEnvVars();

export const DFX_NETWORK = envVars.dfxNetwork;
export const HOST = envVars.host;

export const FETCH_ROOT_KEY: boolean = envVars.fetchRootKey === "true";

const snsAggregatorUrlEnv = envVars.snsAggregatorUrl ?? "";
const snsAggregatorUrl = (url: string) => {
  try {
    const { hostname } = new URL(url);
    if (isLocalhost(hostname)) {
      return url;
    }

    // If the nns-dapp is running in localhost, we need to add `raw` to the URL to avoid CORS issues.
    if (isBrowser && isLocalhost(window.location.hostname)) {
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
  ENABLE_SNS_VOTING: T;
  ENABLE_SNS_AGGREGATOR: T;
  ENABLE_CKBTC: T;
  ENABLE_CKTESTBTC: T;
  ENABLE_ICP_ICRC: T;
  ENABLE_SIMULATE_MERGE_NEURONS: T;
  ENABLE_NEURON_SETTINGS: T;
  ENABLE_INSTANT_UNLOCK: T;
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
  envVars?.featureFlags ??
    '{"ENABLE_SNS_VOTING": true, "ENABLE_SNS_AGGREGATOR": true, "ENABLE_CKBTC": true, "ENABLE_CKTESTBTC": false, "ENABLE_ICP_ICRC": false, "ENABLE_SIMULATE_MERGE_NEURONS": false, "ENABLE_NEURON_SETTINGS": false, "ENABLE_INSTANT_UNLOCK": false}'
);

export const IS_TESTNET: boolean =
  DFX_NETWORK !== "mainnet" &&
  FETCH_ROOT_KEY === true &&
  !(HOST.includes(".icp-api.io") || HOST.includes(".ic0.app"));

// TODO: display test environment warning on mainnet according configuration
// DFX_NETWORK === new_environment_to_be_configured
export const IS_TEST_MAINNET = false;
