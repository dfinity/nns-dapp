import type { AccountsStore } from "$lib/stores/accounts.store";
import type { Account } from "$lib/types/account";
import { InsufficientAmountError } from "$lib/types/common.errors";
import { checkAccountId } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";

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
  accountsStore: { main, subAccounts, hardwareWallets },
}: {
  identifier: string | undefined;
  accountsStore: AccountsStore;
}): Account | undefined => {
  if (identifier === undefined) {
    return undefined;
  }

  if (main?.identifier === identifier) {
    return main;
  }

  const subAccount: Account | undefined = subAccounts?.find(
    (account: Account) => account.identifier === identifier
  );

  if (subAccount !== undefined) {
    return subAccount;
  }

  return hardwareWallets?.find(
    (account: Account) => account.identifier === identifier
  );
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
