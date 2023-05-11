import { isBrowser } from "@dfinity/auth-client/lib/cjs/storage";
import { isNullish } from "@dfinity/utils";

const localDevelopment = import.meta.env.DEV;

type EnvironmentVars = {
  // Environments without ckBTC canisters are valid
  ckbtcIndexCanisterId?: string;
  ckbtcLedgerCanisterId?: string;
  ckbtcMinterCanisterId?: string;
  cyclesMintingCanisterId: string;
  dfxNetwork: string;
  featureFlags: string;
  fetchRootKey: string;
  host: string;
  governanceCanisterId: string;
  identityServiceUrl: string;
  ledgerCanisterId: string;
  ownCanisterId: string;
  // Environments without SNS aggregator are valid
  snsAggregatorUrl?: string;
  wasmCanisterId: string;
  // Environments without TVL are valid
  tvlCanisterId?: string;
};

const mandatoryEnvVarKeys: EnvironmentVars = {
  cyclesMintingCanisterId: "",
  dfxNetwork: "",
  featureFlags: "",
  fetchRootKey: "",
  host: "",
  governanceCanisterId: "",
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

const convertEmtpyStringToUndefined = (
  str: string | undefined
): string | undefined => (str === "" ? undefined : str);

const mapEmtpyStringsToUndefined = (obj: {
  [key: string]: string | undefined;
}): { [key: string]: string | undefined } => {
  const result: { [key: string]: string | undefined } = {};
  Object.keys(obj).forEach((key: string) => {
    result[key] = convertEmtpyStringToUndefined(obj[key]);
  });
  return result;
};

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
  const envVars: Record<string, string | undefined> =
    mapEmtpyStringsToUndefined(dataElement.dataset ?? {});
  assertEnvVars(envVars);
  return envVars;
};

const getBuildEnvVars = (): EnvironmentVars => {
  const envVars = {
    // Environments without ckBTC canisters are valid
    ckbtcIndexCanisterId: convertEmtpyStringToUndefined(
      import.meta.env.VITE_CKBTC_INDEX_CANISTER_ID
    ),
    ckbtcLedgerCanisterId: convertEmtpyStringToUndefined(
      import.meta.env.VITE_CKBTC_LEDGER_CANISTER_ID
    ),
    ckbtcMinterCanisterId: convertEmtpyStringToUndefined(
      import.meta.env.VITE_CKBTC_MINTER_CANISTER_ID
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
    governanceCanisterId: convertEmtpyStringToUndefined(
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
    tvlCanisterId: convertEmtpyStringToUndefined(
      import.meta.env.VITE_TVL_CANISTER_ID
    ),
  };
  assertEnvVars(envVars);
  return envVars;
};

/**
 * Returns the environment variables depending on the environment.
 *
 * The environment variables might be set in the HTML or from the build environment variables.
 *
 * We use the build environment variables when one of the following conditions is true:
 * - Not in the browser
 * - Local development server
 *
 * All the other scenarios use the HTML environment variables.
 *
 * @returns {EnvironmentVars}
 */
export const getEnvVars = (): EnvironmentVars => {
  // There are two instances of local dev server:
  // - The local dev server started by `npm run dev`
  // - The local dev server started by `npm run preview`. The only way to distinguis this one is by the port.
  // We need to check `isBrowser` to skip the check when running the build.
  const isDevServer =
    localDevelopment ||
    (isBrowser && ["5173", "4173"].includes(window.location.port));
  if (!isBrowser || isDevServer) {
    return getBuildEnvVars();
  }
  return getHtmlEnvVars();
};
