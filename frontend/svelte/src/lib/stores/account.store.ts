import { writable } from "svelte/store";
import type { Transaction } from "../canisters/nns-dapp/nns-dapp.types";
import type { Account } from "../types/account";

export interface AccountStore {
  accountIdentifier: string | undefined;
  account: Account | undefined;
  transactions: Transaction[] | undefined;
}

/**
 * A store that contains selected account and it's transactions.
 */
const initAccountStore = () => {
  const initialState: AccountStore = {
    accountIdentifier: undefined,
    account: undefined,
    transactions: undefined,
  };
  const { subscribe, set, update } = writable<AccountStore>(initialState);

  return {
    subscribe,
    set,
    selectAccountIdentifier: (accountIdentifier: string) =>
      update(() => ({
        ...initialState,
        accountIdentifier,
      })),
    selectAccount: (account: Account) =>
      update((state) => ({
        ...state,
        transactions: undefined,
        account,
      })),
    reset: () => set(initialState),
  };
};

export const accountStore = initAccountStore();
