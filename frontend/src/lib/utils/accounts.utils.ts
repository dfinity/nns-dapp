import type { AccountsStoreData } from "$lib/stores/accounts.store";
import type { SnsAccountsStoreData } from "$lib/stores/sns-accounts.store";
import type { Account } from "$lib/types/account";
import { NotEnoughAmountError } from "$lib/types/common.errors";
import { sumTokenAmounts } from "$lib/utils/token.utils";
import { isUniverseNns } from "$lib/utils/universe.utils";
import { isNullish } from "$lib/utils/utils";
import { decodeIcrcAccount } from "@dfinity/ledger";
import { checkAccountId, TokenAmount } from "@dfinity/nns";
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
  accounts: AccountsStoreData;
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
    try {
      // TODO: Find a better solution to check if the address is valid for SNS as well.
      // It might also be an SNS address
      decodeIcrcAccount(address);
      return false;
    } catch {
      _;
    }
    {
      return true;
    }
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

export const findAccount = ({
  identifier,
  accounts,
}: {
  identifier: string | undefined | null;
  accounts: Account[];
}): Account | undefined => {
  if (identifier === undefined || identifier === null) {
    return undefined;
  }

  return accounts.find(({ identifier: id }) => id === identifier);
};

export const getAccountByRootCanister = ({
  identifier,
  nnsAccounts,
  snsAccounts,
  rootCanisterId,
}: {
  identifier: string | undefined;
  nnsAccounts: Account[];
  snsAccounts: SnsAccountsStoreData;
  rootCanisterId: Principal;
}): Account | undefined => {
  if (identifier === undefined) {
    return undefined;
  }

  if (isUniverseNns(rootCanisterId)) {
    return findAccount({
      identifier,
      accounts: nnsAccounts,
    });
  }

  return findAccount({
    identifier,
    accounts: snsAccounts[rootCanisterId.toText()]?.accounts ?? [],
  });
};

export const getAccountsByRootCanister = ({
  nnsAccounts,
  snsAccounts,
  rootCanisterId,
}: {
  nnsAccounts: Account[];
  snsAccounts: SnsAccountsStoreData;
  rootCanisterId: Principal;
}): Account[] | undefined => {
  if (isUniverseNns(rootCanisterId)) {
    return nnsAccounts;
  }

  return snsAccounts[rootCanisterId.toText()]?.accounts;
};

/**
 * Throws error if the account doesn't have enough balance.
 * @throws NotEnoughAmountError
 */
export const assertEnoughAccountFunds = ({
  account,
  amountE8s,
}: {
  account: Account;
  amountE8s: bigint;
}): void => {
  if (account.balance.toE8s() < amountE8s) {
    throw new NotEnoughAmountError("error.insufficient_funds");
  }
};

/**
 * Returns `undefined` if the "main" account was not find.
 * @param accounts
 */
export const mainAccount = (accounts: Account[]): Account | undefined => {
  return accounts.find((account) => account.type === "main");
};

export const accountName = ({
  account,
  mainName,
}: {
  account: Account | undefined;
  mainName: string;
}): string =>
  account?.name ?? (account?.type === "main" ? mainName : account?.name ?? "");

export const sumNnsAccounts = (
  accounts: AccountsStoreData | undefined
): TokenAmount | undefined =>
  accounts?.main?.balance !== undefined
    ? sumTokenAmounts(
        accounts?.main?.balance,
        ...(accounts?.subAccounts || []).map(({ balance }) => balance),
        ...(accounts?.hardwareWallets || []).map(({ balance }) => balance)
      )
    : undefined;

export const sumAccounts = (
  accounts: Account[] | undefined
): TokenAmount | undefined =>
  isNullish(accounts) || accounts.length === 0
    ? undefined
    : sumTokenAmounts(...accounts.map(({ balance }) => balance));
