import { NNS_IC_ORG_ALTERNATIVE_ORIGIN } from "$lib/constants/origin.constants";

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
