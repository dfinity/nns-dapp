import { AppPath } from "$lib/constants/routes.constants";
import type { AccountsStore } from "$lib/stores/accounts.store";
import type { Account } from "$lib/types/account";
import { InsufficientAmountError } from "$lib/types/common.errors";
import { checkAccountId } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { getLastPathDetail, isRoutePath } from "./app-path.utils";

/*
 * Returns the principal's main or hardware account
 *
 * Subaccounts do not have Principal
 */
export const getAccountByPrincipal = ({
  principal,
  accounts: { main, hardwareWallets },
}: {
  principal: string;
  accounts: AccountsStore;
}): Account | undefined => {
  if (main?.principal?.toText() === principal) {
    return main;
  }

  return hardwareWallets?.find(
    ({ principal: hwPrincipal }) => hwPrincipal?.toText() === principal
  );
};

/**
 * Is the address a valid entry to proceed with any action such as transferring ICP?
 */
export const invalidAddress = (address: string | undefined): boolean => {
  if (address === undefined) {
    return true;
  }
  try {
    checkAccountId(address);
    return false;
  } catch (_) {
    return true;
  }
};

/**
 * Is the address an empty value? Useful to detect if user is currently entering an address regardless if valid or invalid
 */
export const emptyAddress = (address: string | undefined): boolean =>
  address === undefined || address.length === 0;

/**
 * Converts address string to Principal.
 * @param address
 * @returns Principal or `undefined` when not valid
 */
export const getPrincipalFromString = (
  address: string
): Principal | undefined => {
  try {
    return Principal.fromText(address);
  } catch (_) {
    return undefined;
  }
};

export const isAccountHardwareWallet = (
  account: Account | undefined
): boolean => account?.type === "hardwareWallet";

export const getAccountFromStore = ({
  identifier,
  accounts,
}: {
  identifier: string | undefined;
  accounts: Account[];
}): Account | undefined => {
  if (identifier === undefined) {
    return undefined;
  }

  return accounts.find(({ identifier: id }) => id === identifier);
};

/**
 * Throws error if the account doesn't have enough balance.
 * @throws InsufficientAmountError
 */
export const assertEnoughAccountFunds = ({
  account,
  amountE8s,
}: {
  account: Account;
  amountE8s: bigint;
}): void => {
  if (account.balance.toE8s() < amountE8s) {
    throw new InsufficientAmountError("error.insufficient_funds");
  }
};

/**
 * Returns `undefined` if the "main" account was not find.
 * @param accounts
 */
export const mainAccount = (accounts: Account[]): Account | undefined => {
  return accounts.find((account) => account.type === "main");
};

/*
 * @param path current route path
 * @return an object containing either a valid account identifier or undefined if not provided for the wallet route or undefined if another route is currently accessed
 */
export const routePathAccountIdentifier = (
  path: string | undefined
): { accountIdentifier: string | undefined } | undefined => {
  if (
    !isRoutePath({
      paths: [AppPath.LegacyWallet, AppPath.Wallet],
      routePath: path,
    })
  ) {
    return undefined;
  }

  const accountIdentifier: string | undefined = getLastPathDetail(path);

  return {
    accountIdentifier:
      accountIdentifier !== undefined && accountIdentifier !== ""
        ? accountIdentifier
        : undefined,
  };
};
