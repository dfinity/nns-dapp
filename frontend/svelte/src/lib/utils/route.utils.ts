export const routePath = (): string => {
  const hash: string = window.location.hash.toLowerCase();
  const pathname: string = routePathname();
  return `${pathname}${hash}`;
};

export const routePathname = (): string => {
  const { pathname } = window.location;
  const base: string = baseHref();
  return pathname.replace(base, "/");
};

// e.g. #/accounts => accounts
export const routeContext = (): string => {
  const path: string = routePath();

  return removeHash({ path }).split("/")[1].toLowerCase();
};

const removeHash = ({ path }: { path: string }) => path.replace("/#", "");

export const replaceHistory = (params: { path: string; query?: string }) => {
  const path: string = concatPathQuery(params);

  if (!supportsHistory()) {
    window.location.replace(path);
    return;
  }

  history.replaceState({}, "", path);
};

export const pushHistory = (params: { path: string; query?: string }) => {
  const path: string = concatPathQuery(params);

  if (!supportsHistory()) {
    window.location.hash = removeHash({ path });
    return;
  }

  history.pushState({}, "", path);
};

const concatPathQuery = ({ path, query }: { path: string; query?: string }) =>
  `${path}${query ? `?${query}` : ""}`;

/**
 * Test if the History API is supported by the devices. On old phones it might not be the case.
 * Source: https://stackoverflow.com/a/6825002/5404186
 */
const supportsHistory = (): boolean =>
  window.history &&
  "pushState" in window.history &&
  typeof window.history.pushState != "undefined";

/**
 * Find base href:
 * // - https://something.com/ -> / (local development)
 * // - https://something.com/v2/ => /v2/ (if the app is deployed on a server that serves from root ("/"), our case)
 */
const baseHref = (): string => {
  const { pathname: baseHref } = new URL(document.baseURI);
  return baseHref;
};
