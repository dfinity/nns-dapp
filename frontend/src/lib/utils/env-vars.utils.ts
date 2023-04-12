import { isBrowser } from "@dfinity/auth-client/lib/cjs/storage";
import { isNullish } from "@dfinity/utils";

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

const mandatoryEnvVarKeys: EnvironmentVars = {
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
  const missingMandatoryEnvVars = Object.keys(mandatoryEnvVarKeys).filter(
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
  const ENV_VARS_ELEMENT_SELECTOR = "meta[name=nns-dapp-vars]";
  const dataElement: HTMLElement | null = window.document.querySelector(
    ENV_VARS_ELEMENT_SELECTOR
  );
  if (isNullish(dataElement)) {
    throw new Error(
      `Missing environment variables element with selector ${ENV_VARS_ELEMENT_SELECTOR} in HTML page.`
    );
  }
  if (dataElement.hasAttribute("enabled")) {
    const envVars: Record<string, unknown> = dataElement.dataset ?? {};
    assertEnvVars(envVars);
    return envVars;
  }
  throw new Error("Environment variables element is disabled.");
};

const convertEmtpyStringToUndefined = (str: string): string | undefined =>
  str === "" ? undefined : str;

const getBuildEnvVars = (): EnvironmentVars => {
  const envVars = {
    // Environments without ckBTC canisters are valid
    ckbtcIndexCanisterId: convertEmtpyStringToUndefined(
      import.meta.env.VITE_CKBTC_INDEX_CANISTER_ID
    ),
    ckbtcLedgerCanisterId: convertEmtpyStringToUndefined(
      import.meta.env.VITE_CKBTC_LEDGER_CANISTER_ID
    ),
    cyclesMintingCanisterId: convertEmtpyStringToUndefined(
      import.meta.env.VITE_CYCLES_MINTING_CANISTER_ID
    ),
    dfxNetwork: convertEmtpyStringToUndefined(import.meta.env.VITE_DFX_NETWORK),
    featureFlags: convertEmtpyStringToUndefined(
      import.meta.env.VITE_FEATURE_FLAGS.replace(/\\"/g, '"')
    ),
    fetchRootKey: convertEmtpyStringToUndefined(
      import.meta.env.VITE_FETCH_ROOT_KEY
    ),
    host: convertEmtpyStringToUndefined(import.meta.env.VITE_HOST),
    governanceCaniserId: convertEmtpyStringToUndefined(
      import.meta.env.VITE_GOVERNANCE_CANISTER_ID
    ),
    identityServiceUrl: convertEmtpyStringToUndefined(
      import.meta.env.VITE_IDENTITY_SERVICE_URL
    ),
    ledgerCanisterId: convertEmtpyStringToUndefined(
      import.meta.env.VITE_LEDGER_CANISTER_ID
    ),
    ownCanisterId: convertEmtpyStringToUndefined(
      import.meta.env.VITE_OWN_CANISTER_ID
    ),
    snsAggregatorUrl: convertEmtpyStringToUndefined(
      import.meta.env.VITE_AGGREGATOR_CANISTER_URL
    ),
    wasmCanisterId: convertEmtpyStringToUndefined(
      import.meta.env.VITE_WASM_CANISTER_ID
    ),
  };
  assertEnvVars(envVars);
  return envVars;
};

export const getEnvVars = (): EnvironmentVars => {
  if (isBrowser && !localDev) {
    try {
      return getHtmlEnvVars();
    } catch (e) {
      console.error(e);
      // Fallback to build env vars
      return getBuildEnvVars();
    }
  }
  return getBuildEnvVars();
};
