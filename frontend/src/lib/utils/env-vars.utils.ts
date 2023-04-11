import { isBrowser } from "@dfinity/auth-client/lib/cjs/storage";

const localDev = import.meta.env.DEV;

type EnvironmentVars = {
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
  // Environments without SNS aggregator are valid
  snsAggregatorUrl?: string;
  wasmCanisterId: string;
};

const defaultMandatoryEnvVars: EnvironmentVars = {
  cyclesMintingCanisterId: "",
  dfxNetwork: "",
  featureFlags: "",
  fetchRootKey: "",
  host: "",
  governanceCaniserId: "",
  identityServiceUrl: "",
  ledgerCanisterId: "",
  ownCanisterId: "",
  wasmCanisterId: "",
};

function assertEnvVars(
  data: Record<string, unknown>
): asserts data is EnvironmentVars {
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

const getHtmlEnvVars = (): EnvironmentVars => {
  const ENV_VARS_ELEMENT_SELECTOR = "meta[name=env-vars]";
  const dataElement: HTMLElement | null = window.document.querySelector(
    ENV_VARS_ELEMENT_SELECTOR
  );
  if (!dataElement) {
    throw new Error(
      `Missing environment variables element with selector ${ENV_VARS_ELEMENT_SELECTOR} in HTML page.`
    );
  }
  const envVars: Record<string, unknown> = dataElement.dataset ?? {};
  assertEnvVars(envVars);
  return envVars;
};

const getBuildEnvVars = (): EnvironmentVars => {
  const envVars = {
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
    // Environments without SNS aggregator are valid
    snsAggregatorUrl: import.meta.env.VITE_AGGREGATOR_CANISTER_URL as string,
    wasmCanisterId: import.meta.env.VITE_WASM_CANISTER_ID,
  };
  assertEnvVars(envVars);
  return envVars;
};

export const getEnvVars = (): EnvironmentVars => {
  if (isBrowser && !localDev) {
    return getHtmlEnvVars();
  }
  return getBuildEnvVars();
};
