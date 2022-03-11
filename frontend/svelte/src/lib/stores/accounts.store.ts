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
  const { subscribe, set } = writable<AccountsStore>({
    main: undefined,
    subAccounts: undefined,
  });

  return {
    subscribe,
    set,
  };
};

export const accountsStore = initAccountsStore();
