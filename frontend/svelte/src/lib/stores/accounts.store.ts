import { writable } from "svelte/store";
import type { Account } from "../types/account";

export interface AccountsStore {
  main: Account | undefined;
  subAccounts: Account[];
}

/**
 * A store that contains the account information.
 */

export const initAccountsStore = () => {
  const { subscribe, set, update } = writable<AccountsStore>({
    main: undefined,
    subAccounts: [],
  });

  return {
    subscribe,
    set,
    addSubAccount(newAccount) {
      update((state) => ({
        ...state,
        subAccounts: [newAccount, ...state.subAccounts],
      }));
    },
  };
};

export const accountsStore = initAccountsStore();
