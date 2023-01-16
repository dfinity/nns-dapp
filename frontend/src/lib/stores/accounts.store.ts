import type { Account } from "$lib/types/account";
import { writable, type Readable } from "svelte/store";

export interface AccountsStoreData {
  main?: Account;
  subAccounts?: Account[];
  hardwareWallets?: Account[];
  certified?: boolean;
}

export interface AccountsStore extends Readable<AccountsStoreData> {
  set: (data: AccountsStoreData) => void;
  reset: () => void;
}

/**
 * A store that contains the account information.
 */
export const initAccountsStore = (): AccountsStore => {
  const initialAccounts: AccountsStoreData = {
    main: undefined,
    subAccounts: undefined,
    hardwareWallets: undefined,
    certified: undefined,
  };

  const { subscribe, set } = writable<AccountsStoreData>(initialAccounts);

  return {
    subscribe,

    set,

    reset: () => set(initialAccounts),
  };
};

export const accountsStore = initAccountsStore();
