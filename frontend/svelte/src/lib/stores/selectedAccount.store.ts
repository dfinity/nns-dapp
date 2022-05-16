import { writable } from "svelte/store";
import type { Transaction } from "../canisters/nns-dapp/nns-dapp.types";
import type { Account } from "../types/account";

export interface SelectedAccountStore {
  account: Account | undefined;
  transactions: Transaction[] | undefined;
}

/**
 * A store that contains selected account and it's transactions.
 */
const initSelectedAccountStore = () => {
  const initialState: SelectedAccountStore = {
    account: undefined,
    transactions: undefined,
  };
  const { subscribe, set } = writable<SelectedAccountStore>(initialState);

  return {
    subscribe,
    set,
    selectAccount: (account: Account) =>
      set({
        account,
        transactions: undefined,
      }),
    resetWithAccount: (account: Account | undefined) =>
      set({
        ...initialState,
        account,
      }),
  };
};

export const selectedAccountStore = initSelectedAccountStore();
