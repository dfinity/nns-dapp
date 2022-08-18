import type { QUERY_PARAM } from "../types/routes";

/**
 * The pathname and the hash without base href and without the query string
 */
export const routePath = (): string => {
  const base: string = baseHref();
  const { pathname, hash } = window.location;
  return `${pathname.replace(base, "/")}${hash
    .replace(/\?.*/, "")
    .toLowerCase()}`;
};

// Cannot use location.search because it's after the hash and it's not present there.
export const getQueryFromUrl = (): string | undefined => {
  const { hash } = window.location;
  return hash.split("?")[1];
};

// e.g. #/accounts => accounts
// e.g. #/wallet/123?a=b => wallet/123
export const routeContext = (): string => {
  const path: string = routePath();

  // remove leading "/" and query params
  return removeHash({ path })
    .replace(/(^\/|\?.*)/g, "")
    .toLowerCase();
};

const removeHash = ({ path }: { path: string }) => path.replace("/#", "");

export const replaceHistory = (params: { path: string; query?: string }) => {
  const path: string = fullPath(params);

  if (!supportsHistory()) {
    window.location.replace(path);
    return;
  }

  history.replaceState({}, "", path);
};

export const pushHistory = (params: { path: string; query?: string }) => {
  const path: string = fullPath(params);

  if (!supportsHistory()) {
    window.location.hash = removeHash({ path });
    return;
  }

  history.pushState({}, "", path);
};

// Note: baseHref() always ends with a /. The "path" parameter may also start with a "/", therefore we replace `//` with `/`.
const fullPath = ({ path, query }: { path: string; query?: string }): string =>
  `${baseHref()}${path}${query !== undefined ? `?${query}` : ""}`.replace(
    /\/\//g,
    "/"
  );

/**
 * Test if the History API is supported by the devices. On old phones it might not be the case.
 * Source: https://stackoverflow.com/a/6825002/5404186
 */
const supportsHistory = (): boolean =>
  window.history !== undefined &&
  "pushState" in window.history &&
  typeof window.history.pushState != "undefined";

/**
 * Returns the value of the base href (the root of the svelte app). Always ends with '/'.
 */
export const baseHref = (): string => {
  const base: HTMLBaseElement | null = document.querySelector("base");
  const { origin }: URL = new URL(document.baseURI);
  return base?.href.replace(origin, "") ?? "/";
};

export const getQueryParam = ({
  key,
  query,
}: {
  key: QUERY_PARAM;
  query: string;
}): string | undefined => {
  const params = new URLSearchParams(query);
  return params.get(key) ?? undefined;
};
