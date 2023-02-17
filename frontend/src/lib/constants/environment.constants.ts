export const DFX_NETWORK = import.meta.env.VITE_DFX_NETWORK;
export const HOST = import.meta.env.VITE_HOST as string;
export const DEV = import.meta.env.DEV;
export const FETCH_ROOT_KEY: boolean =
  import.meta.env.VITE_FETCH_ROOT_KEY === "true";

// TODO: Add as env var https://dfinity.atlassian.net/browse/GIX-1245
// Local development needs `.raw` to avoid CORS issues for now.
// TODO: Fix CORS issues
export const SNS_AGGREGATOR_CANISTER_URL: string | undefined =
  (import.meta.env.VITE_AGGREGATOR_CANISTER_URL as string) === ""
    ? undefined
    : (import.meta.env.VITE_AGGREGATOR_CANISTER_URL as string);
export const OLD_MAINNET_OWN_CANISTER_URL = "https://nns.ic0.app";

export interface FeatureFlags<T> {
  ENABLE_SNS_2: T;
  ENABLE_SNS_VOTING: T;
  ENABLE_SNS_AGGREGATOR: T;
  ENABLE_CKBTC_LEDGER: T;
  ENABLE_CKBTC_RECEIVE: T;
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
    '{"ENABLE_SNS_2":false, "ENABLE_SNS_VOTING": false, "ENABLE_SNS_AGGREGATOR": false, "ENABLE_CKBTC_LEDGER": true, "ENABLE_CKBTC_RECEIVE": false}'
);

export const IS_TESTNET: boolean =
  DFX_NETWORK !== "mainnet" &&
  FETCH_ROOT_KEY === true &&
  !(HOST.includes(".icp-api.io") || HOST.includes(".ic0.app"));

// TODO: disable TVL display locally until we use the XCR canister to fetch teh ICP<>USD exchange rate and a certified endpoint to fetch the TVL
export const ENABLE_TVL = !DEV;
