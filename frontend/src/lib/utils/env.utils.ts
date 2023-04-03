import { NNS_IC_ORG_ALTERNATIVE_ORIGIN } from "$lib/constants/origin.constants";
import { isBrowser } from "@dfinity/auth-client/lib/cjs/storage";

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

type DataSet = {
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
  ledgerCanisterUrl: string;
  ownCanisterId: string;
  ownCanisterUrl: string;
  // Environments without SNS aggregator are valid
  snsAggregatorUrl?: string;
  wasmCanisterId: string;
};
export const getHtmlEnvVars = (): DataSet | undefined => {
  if (isBrowser) {
    const dataElement: HTMLElement | null = window.document.querySelector(
      "[name='nns-dapp-vars']"
    );
    return (dataElement?.dataset as DataSet) ?? undefined;
  }
};
