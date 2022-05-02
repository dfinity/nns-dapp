import { Principal } from "@dfinity/principal";
import { ACCOUNT_ADDRESS_MIN_LENGTH } from "../constants/accounts.constants";
import type { AccountsStore } from "../stores/accounts.store";
import type { Account } from "../types/account";

/*
 * Returns the principal's main or hardware account
 *
 * Subaccounts do not have Principal
 */
export const getAccountByPrincipal = ({
  principal,
  accounts,
}: {
  principal: string;
  accounts: AccountsStore;
}): Account | undefined => {
  if (accounts.main?.principal?.toText() === principal) {
    return accounts.main;
  }

  // TODO: Check also the hardware wallets L2-433
  return undefined;
};

/**
 * Is the address a valid entry to proceed with any action such as transferring ICP?
 */
export const invalidAddress = (address: string | undefined): boolean =>
  address === undefined || address.length < ACCOUNT_ADDRESS_MIN_LENGTH;

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
