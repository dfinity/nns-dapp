import { writable } from "svelte/store";
import type { Account } from "../types/account";

export interface AccountsStore {
  main?: Account;
  subAccounts?: Account[];
  hardwareWallets?: Account[];
}

/**
 * A store that contains the account information.
 */
export const initAccountsStore = () => {
  const initialAccounts: AccountsStore = {
    main: undefined,
    subAccounts: undefined,
    hardwareWallets: undefined,
  };

  const { subscribe, set } = writable<AccountsStore>(initialAccounts);

  return {
    subscribe,
    set,

    reset: () => set(initialAccounts),
  };
};

export const accountsStore = initAccountsStore();
