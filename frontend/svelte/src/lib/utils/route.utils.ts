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

// e.g. #/accounts => accounts
export const routeContext = (): string => {
  const path: string = routePath();

  return removeHash({ path }).split("/")[1].toLowerCase();
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
  `${baseHref()}${path}${query ? `?${query}` : ""}`.replace(/\/\//g, "/");

/**
 * Test if the History API is supported by the devices. On old phones it might not be the case.
 * Source: https://stackoverflow.com/a/6825002/5404186
 */
const supportsHistory = (): boolean =>
  window.history &&
  "pushState" in window.history &&
  typeof window.history.pushState != "undefined";

/**
 * Returns the value of the base href (the root of the svelte app). Always ends with '/'.
 */
export const baseHref = (): string => {
  const base: HTMLBaseElement | undefined = document.querySelector("base");
  const { origin }: URL = new URL(document.baseURI);
  return base?.href.replace(origin, "") || "/";
};
