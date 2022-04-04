import { writable } from "svelte/store";
import type { Account } from "../types/account";

export interface AccountsStore {
  main?: Account;
  subAccounts?: Account[];
}

/**
 * A store that contains the account information.
 */
export const initAccountsStore = () => {
  const initialAccounts: AccountsStore = {
    main: undefined,
    subAccounts: undefined,
  };

  const { subscribe, set } = writable<AccountsStore>(initialAccounts);

  return {
    subscribe,
    set,

    reset: () => set(initialAccounts),
  };
};

export const accountsStore = initAccountsStore();
