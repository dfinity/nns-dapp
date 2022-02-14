import { memoize } from "../lib/utils/optimization.utils";

export enum AppPath {
  Authentication = "/",
  Accounts = "/#/accounts",
  Neurons = "/#/neurons",
  Proposals = "/#/proposals",
  Canisters = "/#/canisters",
  Wallet = "/#/wallet",
  ProposalDetails = "/#/proposal",
}

const pathValidation = (path: AppPath): string =>
  ({
    // exceptions only
    [AppPath.Wallet]: `${AppPath.Wallet}/[a-zA-Z0-9]+`,
    [AppPath.ProposalDetails]: `${AppPath.ProposalDetails}/[0-9]+`,
  }[path] || path);

export const urlToAppPath = (url: string): AppPath =>
  Object.values(AppPath).find((path) =>
    isRoutePath({ path, routePath: url })
  ) || null;

export const isRoutePath: ({
  path,
  routePath,
}: {
  path: AppPath;
  routePath: string;
}) => boolean = memoize(({ path, routePath }) =>
  new RegExp(`^${pathValidation(path)}$`).test(routePath)
);
