import { writable } from "svelte/store";
import type { Transaction } from "../canisters/nns-dapp/nns-dapp.types";
import type { Account } from "../types/account";

export interface SelectedAccountStore {
  accountIdentifier: string | undefined;
  account: Account | undefined;
  transactions: Transaction[] | undefined;
}

/**
 * A store that contains selected account and it's transactions.
 */
const initSelectedAccountStore = () => {
  const initialState: SelectedAccountStore = {
    accountIdentifier: undefined,
    account: undefined,
    transactions: undefined,
  };
  const { subscribe, set, update } =
    writable<SelectedAccountStore>(initialState);

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

export const selectedAccountStore = initSelectedAccountStore();
