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

export const pathValidation = (path: AppPath): string =>
  ({
    // exceptions only
    [AppPath.Wallet]: "/#/wallet/[a-zA-Z0-9]+",
    [AppPath.ProposalDetails]: "/#/proposal/[0-9]+",
  }[path] || path);

export const comparePathWithRoutePath: (
  path: AppPath,
  routePath: string
) => boolean = memoize((path: AppPath, routePath: string) =>
  new RegExp(`^${pathValidation(path)}$`).test(routePath)
);
