import type { Account } from "$lib/types/account";
import { writable } from "svelte/store";

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
