import { NNS_IC_ORG_ALTERNATIVE_ORIGIN } from "$lib/constants/origin.constants";
import { isBrowser } from "@dfinity/auth-client/lib/cjs/storage";

const localDev = import.meta.env.DEV;

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

type EnvironmentDataSet = {
  // Environments without ckBTC canisters are valid
  ckbtcIndexCanisterId?: string;
  ckbtcLedgerCanisterId?: string;
  cyclesMintingCanisterId: string;
  dfxNetwork: string;
  featureFlags: string;
  fetchRootKey: string;
  host: string;
  governanceCaniserId: string;
  identityServiceUrl: string;
  ledgerCanisterId: string;
  ownCanisterId: string;
  ownCanisterUrl: string;
  // Environments without SNS aggregator are valid
  snsAggregatorUrl?: string;
  wasmCanisterId: string;
};

const defaultMandatoryEnvVars: EnvironmentDataSet = {
  cyclesMintingCanisterId: "",
  dfxNetwork: "",
  featureFlags: "",
  fetchRootKey: "",
  host: "",
  governanceCaniserId: "",
  identityServiceUrl: "",
  ledgerCanisterId: "",
  ownCanisterId: "",
  ownCanisterUrl: "",
  wasmCanisterId: "",
};

function assertEnvVars(
  data: Record<string, unknown>
): asserts data is EnvironmentDataSet {
  const missingMandatoryEnvVars = Object.keys(defaultMandatoryEnvVars).filter(
    (key) => data[key] === undefined
  );
  if (missingMandatoryEnvVars.length > 0) {
    throw new Error(
      `Missing mandatory environment variables: ${missingMandatoryEnvVars.join(
        ", "
      )}`
    );
  }
}

const getHtmlEnvVars = (): EnvironmentDataSet => {
  const dataElement: HTMLElement | null = window.document.querySelector(
    "[name='nns-dapp-vars']"
  );
  if (!dataElement) {
    throw new Error("Missing environment variables in HTML page");
  }
  const envVarsDataSet: Record<string, unknown> = dataElement.dataset ?? {};
  assertEnvVars(envVarsDataSet);
  return envVarsDataSet;
};

const getBuildEnvVars = (): EnvironmentDataSet => {
  const envVarsDataSet = {
    // Environments without ckBTC canisters are valid
    ckbtcIndexCanisterId: import.meta.env.VITE_CKBTC_INDEX_CANISTER_ID,
    ckbtcLedgerCanisterId: import.meta.env.VITE_CKBTC_LEDGER_CANISTER_ID,
    cyclesMintingCanisterId: import.meta.env
      .VITE_CYCLES_MINTING_CANISTER_ID as string,
    dfxNetwork: import.meta.env.VITE_DFX_NETWORK as string,
    featureFlags: import.meta.env.VITE_FEATURE_FLAGS.replace(
      /\\"/g,
      '"'
    ) as string,
    fetchRootKey: import.meta.env.VITE_FETCH_ROOT_KEY as string,
    host: import.meta.env.VITE_HOST as string,
    governanceCaniserId: import.meta.env.VITE_GOVERNANCE_CANISTER_ID as string,
    identityServiceUrl: import.meta.env.VITE_IDENTITY_SERVICE_URL as string,
    ledgerCanisterId: import.meta.env.VITE_LEDGER_CANISTER_ID as string,
    ownCanisterId: import.meta.env.VITE_OWN_CANISTER_ID as string,
    ownCanisterUrl: import.meta.env.VITE_OWN_CANISTER_URL as string,
    // Environments without SNS aggregator are valid
    snsAggregatorUrl: import.meta.env.VITE_AGGREGATOR_CANISTER_URL as string,
    wasmCanisterId: import.meta.env.VITE_WASM_CANISTER_ID,
  };
  assertEnvVars(envVarsDataSet);
  return envVarsDataSet;
};

export const getEnvVars = (): EnvironmentDataSet => {
  if (isBrowser && !localDev) {
    return getHtmlEnvVars();
  }
  return getBuildEnvVars();
};
