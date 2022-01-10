export const routePath = (): string => {
  const hash: string = window.location.hash.toLowerCase();
  const pathname: string = routePathname();

  const split: "/" | "" = pathname === "" ? "/" : "";

  return `${pathname}${split}${hash}`;
};

export const routePathname = (): string => {
  const { pathname } = window.location;
  return pathname.replace(/\/$/, "");
};

// e.g. #/accounts => accounts
export const routeContext = (): string => {
  const path: string = routePath();

  return removeHash({ path }).split("/")[1].toLowerCase();
};

const removeHash = ({ path }: { path: string }) => path.replace("/#", "");

export type HistoryAction = "push" | "replace";

export const updateHistory = ({
  path,
  action,
  query,
}: {
  path: string;
  action: HistoryAction;
  query?: string;
}) => {
  const fullPath: string = `${path}${query ? `?${query}` : ""}`;

  if (action === "replace") {
    replaceHistory({ path: fullPath });
    return;
  }

  pushHistory({ path: fullPath });
};

const replaceHistory = ({ path }: { path: string }) => {
  if (!supportHistory()) {
    window.location.replace(path);
    return;
  }

  history.replaceState({}, "", `${baseUrl()}${path}`);
};

const pushHistory = ({ path }: { path: string }) => {
  if (!supportHistory()) {
    window.location.hash = removeHash({ path });
    return;
  }

  history.pushState({}, "", `${baseUrl()}${path}`);
};

const supportHistory = (): boolean => {
  const ua: string = window.navigator.userAgent;
  if (
    (ua.indexOf("Android 2.") !== -1 || ua.indexOf("Android 4.0") !== -1) &&
    ua.indexOf("Mobile Safari") !== -1 &&
    ua.indexOf("Chrome") === -1 &&
    ua.indexOf("Windows Phone") === -1
  ) {
    return false;
  }
  return window.history && "pushState" in window.history;
};

const baseUrl = (): string => {
  if (document.getElementsByTagName("base").length === 0) {
    return "";
  }

  const path = new URL(document.baseURI).pathname;
  return path.replace(/\/$/, "");
};
