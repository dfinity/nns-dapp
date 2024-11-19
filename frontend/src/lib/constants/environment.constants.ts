import { getEnvVars } from "$lib/utils/env-vars.utils";

const envVars = getEnvVars();

export const DFX_NETWORK = envVars.dfxNetwork;
export const HOST = envVars.host;

export const FETCH_ROOT_KEY: boolean = envVars.fetchRootKey === "true";

export const SNS_AGGREGATOR_CANISTER_URL = envVars.snsAggregatorUrl ?? "";

export interface FeatureFlags<T> {
  ENABLE_CKBTC: T;
  ENABLE_CKTESTBTC: T;
  DISABLE_IMPORT_TOKEN_VALIDATION_FOR_TESTING: T;
  ENABLE_NEURON_VISIBILITY: T;
  ENABLE_PERIODIC_FOLLOWING_CONFIRMATION: T;
  // Used only in tests and set up in jest-setup.ts
  TEST_FLAG_EDITABLE: T;
  TEST_FLAG_NOT_EDITABLE: T;
}
const defaultFeatureFlags: FeatureFlags<boolean> = {
  ENABLE_CKBTC: false,
  ENABLE_CKTESTBTC: false,
  DISABLE_IMPORT_TOKEN_VALIDATION_FOR_TESTING: false,
  ENABLE_NEURON_VISIBILITY: false,
  ENABLE_PERIODIC_FOLLOWING_CONFIRMATION: false,
  TEST_FLAG_EDITABLE: false,
  TEST_FLAG_NOT_EDITABLE: false,
};

export type FeatureKey = keyof FeatureFlags<boolean>;

/**
 * DO NOT USE DIRECTLY
 *
 * @see feature-flags.store.ts to use feature flags
 */
export const FEATURE_FLAG_ENVIRONMENT: FeatureFlags<boolean> =
  envVars?.featureFlags
    ? JSON.parse(envVars?.featureFlags)
    : defaultFeatureFlags;

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
