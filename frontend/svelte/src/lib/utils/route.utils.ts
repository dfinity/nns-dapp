// Get the current route from the location hash to lower case prefixed with a slash. Example: #/ICP => /#/icp
export const routePath = (): string => `/${window.location.hash.toLowerCase()}`;

export const appPath = (): string => {
  const { pathname } = window.location;
  return `${pathname.substring(0, pathname.lastIndexOf("/"))}`;
};

// e.g. #/accounts => accounts
export const routeContext = (): string =>
  routePath().split("/").slice(2)[0].toLowerCase();
