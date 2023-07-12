import type { AccountIdentifierString } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { UniversesAccounts } from "$lib/derived/accounts-list.derived";
import type { AccountsStoreData } from "$lib/stores/accounts.store";
import { ENABLE_ICP_ICRC } from "$lib/stores/feature-flags.store";
import type { IcrcAccountIdentifier } from "$lib/stores/icrc-transactions.store";
import type { Account } from "$lib/types/account";
import { NotEnoughAmountError } from "$lib/types/common.errors";
import { TransactionNetwork } from "$lib/types/transaction";
import { sumAmountE8s } from "$lib/utils/token.utils";
import { isTransactionNetworkBtc } from "$lib/utils/transactions.utils";
import { BtcNetwork, parseBtcAddress, type BtcAddress } from "@dfinity/ckbtc";
import { decodeIcrcAccount } from "@dfinity/ledger";
import { AccountIdentifier, SubAccount, checkAccountId } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { isNullish, nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";
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

  // TODO: reactive variable as parameter
  const feature = get(ENABLE_ICP_ICRC);

  // NNS universe doesn't use ICRC yet
  if (isUniverseNns(rootCanisterId) && !feature) {
    return invalidIcpAddress(address);
  }

  // TODO: if NNS and Icrc fails, try ICP valid address

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
  amountE8s,
}: {
  account: Account;
  amountE8s: bigint;
}): void => {
  if (account.balanceE8s < amountE8s) {
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
): bigint | undefined =>
  accounts?.main?.balanceE8s !== undefined
    ? sumAmountE8s(
        accounts?.main?.balanceE8s,
        ...(accounts?.subAccounts || []).map(({ balanceE8s }) => balanceE8s),
        ...(accounts?.hardwareWallets || []).map(({ balanceE8s }) => balanceE8s)
      )
    : undefined;

export const sumAccounts = (
  accounts: Account[] | undefined
): bigint | undefined =>
  isNullish(accounts) || accounts.length === 0
    ? undefined
    : sumAmountE8s(...accounts.map(({ balanceE8s }) => balanceE8s));

export const hasAccounts = (accounts: Account[]): boolean =>
  accounts.length > 0;

// TODO: to be used only with feature flag on
// TODO: try to convert from ICRC and if fails fallback to string ICP account identifier
//  - Can be useful to support both old and new url parameters in Wallet
//  - Can also be useful for transferICP which reload the balance and which may be call with or without ICRC and with or without a related address
export const accountIdentifierFromIcrc = (
  icrcAccountIdentifier: IcrcAccountIdentifier
): AccountIdentifierString => {
  const { owner: principal, subaccount } = decodeIcrcAccount(
    icrcAccountIdentifier
  );

  const sub = nonNullish(subaccount)
    ? SubAccount.fromBytes(subaccount)
    : undefined;

  // TODO: handle errors in caller
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
