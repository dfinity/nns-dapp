import { getEnvVars } from "$lib/utils/env-vars.utils";
import { addRawToUrl } from "$lib/utils/env.utils";

const envVars = getEnvVars();

export const DFX_NETWORK = envVars.dfxNetwork;
export const HOST = envVars.host;
export const DEV = import.meta.env.DEV;
export const FETCH_ROOT_KEY: boolean = envVars.fetchRootKey === "true";

const snsAggregatorUrlEnv = envVars.snsAggregatorUrl ?? "";
const snsAggregatorUrl = (url: string) => {
  try {
    const { hostname } = new URL(url);
    if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
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
  envVars?.featureFlags ??
    '{"ENABLE_SNS_VOTING": false, "ENABLE_SNS_AGGREGATOR": true, "ENABLE_CKBTC": true, "ENABLE_CKTESTBTC": false}'
);

export const IS_TESTNET: boolean =
  DFX_NETWORK !== "mainnet" &&
  FETCH_ROOT_KEY === true &&
  !(HOST.includes(".icp-api.io") || HOST.includes(".ic0.app"));

// Disable TVL or transaction rate warning locally because that information is not crucial when we develop
export const ENABLE_METRICS = !DEV;

export const FORCE_CALL_STRATEGY: "query" | undefined = undefined;

export const IS_TEST_ENV = process.env.NODE_ENV === "test";

// When the QR code is rendered (draw), it triggers an event that is replicated to a property to get to know if the QR code has been or not rendered.
// We use a constant / environment variable that way, we can mock it to `true` for test purpose.
// Jest has trouble loading the QR-code dependency and because the QR-code content is anyway covered by e2e snapshot testing in gix-cmp.
export const QR_CODE_RENDERED_DEFAULT_STATE = false;

// Here too, Jest has trouble loading the QR-code reader dependency asynchronously (`await import ("")`).
// npm run test leads to error -> segmentation fault  npm run test src/tests/lib/modals/transaction/TransactionModal.spec.ts
// That's why we use a constant / environment variable that way, we can mock it to `false` for test purpose.
export const ENABLE_QR_CODE_READER = true;
