import { getEnvVars } from "$lib/utils/env-vars.utils";

const envVars = getEnvVars();

export const DFX_NETWORK = envVars.dfxNetwork;
export const HOST = envVars.host;

export const FETCH_ROOT_KEY: boolean = envVars.fetchRootKey === "true";

export const SNS_AGGREGATOR_CANISTER_URL = envVars.snsAggregatorUrl ?? "";

export const ICP_SWAP_URL = envVars.icpSwapUrl ?? "";

export interface FeatureFlags<T> {
  ENABLE_CKTESTBTC: T;
  DISABLE_IMPORT_TOKEN_VALIDATION_FOR_TESTING: T;
  ENABLE_PERIODIC_FOLLOWING_CONFIRMATION: T;
  ENABLE_EXPORT_NEURONS_REPORT: T;
  ENABLE_USD_VALUES: T;
  ENABLE_USD_VALUES_FOR_NEURONS: T;
  ENABLE_PORTFOLIO_PAGE: T;
  // Used only in tests and set up in jest-setup.ts
  TEST_FLAG_EDITABLE: T;
  TEST_FLAG_NOT_EDITABLE: T;
  ENABLE_IMPORT_TOKEN_BY_URL: T;
}
export const defaultFeatureFlagValues: FeatureFlags<boolean> = {
  ENABLE_CKTESTBTC: false,
  DISABLE_IMPORT_TOKEN_VALIDATION_FOR_TESTING: false,
  ENABLE_PERIODIC_FOLLOWING_CONFIRMATION: false,
  ENABLE_EXPORT_NEURONS_REPORT: false,
  ENABLE_USD_VALUES: false,
  ENABLE_USD_VALUES_FOR_NEURONS: false,
  ENABLE_PORTFOLIO_PAGE: false,
  TEST_FLAG_EDITABLE: false,
  TEST_FLAG_NOT_EDITABLE: false,
  ENABLE_IMPORT_TOKEN_BY_URL: false,
};

export type FeatureKey = keyof FeatureFlags<boolean>;

const getFeatureFlagsFromEnv = (): FeatureFlags<boolean> => {
  let featureFlags = {};
  try {
    featureFlags = JSON.parse(envVars?.featureFlags);
  } catch (e) {
    console.error("Error parsing featureFlags", e);
  }
  // Complement the default flags with the ones from the environment to avoid missing flags.
  return { ...defaultFeatureFlagValues, ...featureFlags };
};

/**
 * DO NOT USE DIRECTLY
 *
 * @see feature-flags.store.ts to use feature flags
 */

export const FEATURE_FLAG_ENVIRONMENT: FeatureFlags<boolean> =
  getFeatureFlagsFromEnv();

export const IS_TESTNET: boolean =
  DFX_NETWORK !== "mainnet" &&
  FETCH_ROOT_KEY === true &&
  !(HOST.includes(".icp-api.io") || HOST.includes(".ic0.app"));

// This is the network name used in the dfx.json file
const APP_TEST_DFX_NETWORK = "app";
const BETA_TEST_DFX_NETWORK = "beta";

export const IS_TEST_MAINNET = [
  APP_TEST_DFX_NETWORK,
  BETA_TEST_DFX_NETWORK,
].includes(envVars.dfxNetwork);
