import { AppPath } from "../constants/routes.constants";
import { memoize } from "./optimization.utils";

const pathValidation = (path: AppPath): string =>
  ({
    // exceptions only
    [AppPath.Wallet]: `${AppPath.Wallet}/[a-zA-Z0-9]+`,
    [AppPath.ProposalDetail]: `${AppPath.ProposalDetail}/[0-9]+`,
  }[path] || path);

export const isAppPath = (routePath: string): routePath is AppPath =>
  Boolean(
    Object.values(AppPath).find((path) => isRoutePath({ path, routePath }))
  );

export const isRoutePath: ({
  path,
  routePath,
}: {
  path: AppPath;
  routePath: string | undefined;
}) => boolean = memoize(({ path, routePath }) =>
  new RegExp(`^${pathValidation(path)}$`).test(routePath)
);
