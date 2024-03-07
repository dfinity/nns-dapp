import type { UniversesAccounts } from "$lib/derived/accounts-list.derived";
import type { IcpAccountsStoreData } from "$lib/derived/icp-accounts.derived";
import type {
  Account,
  AccountIdentifierText,
  IcpAccountIdentifierText,
} from "$lib/types/account";
import { NotEnoughAmountError } from "$lib/types/common.errors";
import { TransactionNetwork } from "$lib/types/transaction";
import { sumAmounts } from "$lib/utils/token.utils";
import { isTransactionNetworkBtc } from "$lib/utils/transactions.utils";
import { BtcNetwork, parseBtcAddress, type BtcAddress } from "@dfinity/ckbtc";
import {
  AccountIdentifier,
  SubAccount,
  checkAccountId,
} from "@dfinity/ledger-icp";
import { decodeIcrcAccount } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import { isNullish, nonNullish } from "@dfinity/utils";
import { isUniverseNns } from "./universe.utils";

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
  accounts: IcpAccountsStoreData;
}): Account | undefined => {
  if (main?.principal?.toText() === principal) {
    return main;
  }

  return hardwareWallets?.find(
    ({ principal: hwPrincipal }) => hwPrincipal?.toText() === principal
  );
};

/**
 * Is the address a valid entry to proceed with?
 *
 * e.g. this check is used in the Send / convert ckBTC to test if an address is a valid Bitcoin address
 */
export const invalidBtcAddress = (address: BtcAddress): boolean => {
  try {
    parseBtcAddress(address);
  } catch (_: unknown) {
    return true;
  }

  return false;
};

/**
 * Is the address a valid entry to proceed with any action such as transferring ICP?
 *
 * The address format depends on the universe. Therefore, the root canister ID is required.
 */
export const invalidAddress = ({
  address,
  network,
  rootCanisterId,
}: {
  address: string | undefined;
  network: TransactionNetwork | undefined;
  rootCanisterId: Principal;
}): boolean => {
  if (isNullish(address)) {
    return true;
  }

  if (isTransactionNetworkBtc(network)) {
    return invalidBtcAddress({
      address,
      network:
        network === TransactionNetwork.BTC_TESTNET
          ? BtcNetwork.Testnet
          : BtcNetwork.Mainnet,
    });
  }

  // NNS universe accepts ICP and ICRC adresses for transactions
  if (isUniverseNns(rootCanisterId)) {
    return invalidIcrcAddress(address) && invalidIcpAddress(address);
  }

  // Consider it as an ICRC address
  return invalidIcrcAddress(address);
};

export const invalidIcpAddress = (address: string | undefined): boolean => {
  if (isNullish(address)) {
    return true;
  }

  try {
    checkAccountId(address);
    return false;
  } catch (_: unknown) {
    // We do not parse the error
  }

  return true;
};

export const invalidIcrcAddress = (address: string | undefined): boolean => {
  if (isNullish(address)) {
    return true;
  }

  try {
    decodeIcrcAccount(address);
    return false;
  } catch (_: unknown) {
    // We do not parse the error
  }

  return true;
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

export const findAccount = <T extends Account>({
  identifier,
  accounts,
}: {
  identifier: AccountIdentifierText | undefined | null;
  accounts: T[];
}): T | undefined => {
  if (isNullish(identifier)) {
    return undefined;
  }

  return accounts.find((account) => {
    const { identifier: id } = account;
    return (
      id === identifier ||
      ("icpIdentifier" in account && account.icpIdentifier === identifier)
    );
  });
};

export const getAccountByRootCanister = ({
  identifier,
  universesAccounts,
  rootCanisterId,
}: {
  identifier: string | undefined;
  universesAccounts: UniversesAccounts;
  rootCanisterId: Principal;
}): Account | undefined =>
  findAccount({
    identifier,
    accounts: universesAccounts[rootCanisterId.toText()] ?? [],
  });

export const getAccountsByRootCanister = ({
  universesAccounts,
  rootCanisterId,
}: {
  universesAccounts: UniversesAccounts;
  rootCanisterId: Principal;
}): Account[] | undefined => universesAccounts[rootCanisterId.toText()];

/**
 * Throws error if the account doesn't have enough balance.
 * @throws NotEnoughAmountError
 */
export const assertEnoughAccountFunds = ({
  account,
  amountUlps,
}: {
  account: Account;
  amountUlps: bigint;
}): void => {
  if (account.balanceUlps < amountUlps) {
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

/**
 * Returns the main account if identifier is nullish but returns undefined if the
 * identfiier is present but not found.
 */
export const findAccountOrDefaultToMain = ({
  identifier,
  accounts,
}: {
  identifier: AccountIdentifierText | undefined | null;
  accounts: Account[];
}): Account | undefined =>
  isNullish(identifier)
    ? mainAccount(accounts)
    : findAccount({
        identifier,
        accounts,
      });

export const accountName = ({
  account,
  mainName,
}: {
  account: Account | undefined;
  mainName: string;
}): string =>
  account?.name ?? (account?.type === "main" ? mainName : account?.name ?? "");

export function sumAccounts(acconts: Account[]): bigint;
export function sumAccounts(acconts: Account[] | undefined): bigint | undefined;
export function sumAccounts(
  accounts: Account[] | undefined
): bigint | undefined {
  return isNullish(accounts)
    ? undefined
    : sumAmounts(...accounts.map(({ balanceUlps }) => balanceUlps));
}

export const hasAccounts = (accounts: Account[]): boolean =>
  accounts.length > 0;

/**
 * The NNS Dapp backend accepts ICP account identifiers. The dapp now also supports Icrc textual representation, which is why we may not always know if an identifier is in ICP format or Icrc format.
 * This utility optimistically tries to interpret the identifier passed as a parameter as an Icrc textual representation and convert it to an ICP identifier.
 * If the conversion fails, the utility returns the identifier passed as the parameter, which could be a valid or invalid ICP identifier.
 *
 * @param accountIdentifier A valid or invalid ICP identifier.
 */
export const toIcpAccountIdentifier = (
  accountIdentifier: AccountIdentifierText
): IcpAccountIdentifierText => {
  try {
    return maybeIcrcToIcpAccountIdentifier(accountIdentifier);
  } catch (err: unknown) {
    // We ignore the error. The provided account identifier was not a valid Icrc account identifier.
    // We continue with the provided account identifier which might either be a valid Icp account identifier or just incorrect.
  }

  return accountIdentifier;
};

const maybeIcrcToIcpAccountIdentifier = (
  accountIdentifier: AccountIdentifierText
): IcpAccountIdentifierText => {
  const { owner: principal, subaccount } = decodeIcrcAccount(accountIdentifier);

  const sub = nonNullish(subaccount)
    ? SubAccount.fromBytes(new Uint8Array(subaccount))
    : undefined;

  if (sub instanceof Error) {
    throw sub;
  }

  return AccountIdentifier.fromPrincipal({
    principal,
    ...(nonNullish(sub) && {
      subAccount: sub,
    }),
  }).toHex();
};

export const filterHardwareWalletAccounts: (account: Account) => boolean = (
  account: Account
): boolean => !isAccountHardwareWallet(account);
