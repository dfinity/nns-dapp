import type { Account } from "$lib/types/account";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";

interface CkBTCAccountStoreData {
  accounts: Account[];
  certified?: boolean;
}

export interface CkBTCAccountsStore extends Readable<CkBTCAccountStoreData> {
  set: (data: CkBTCAccountStoreData) => void;
  reset: () => void;
}

/**
 * A store that contains the ckBTC accounts.
 */
export const initCkBTCAccountsStore = (): CkBTCAccountsStore => {
  const initialAccounts: CkBTCAccountStoreData = {
    accounts: [],
    certified: undefined,
  };

  const { subscribe, set } = writable<CkBTCAccountStoreData>(initialAccounts);

  return {
    subscribe,

    set,

    reset: () => set(initialAccounts),
  };
};

export const ckBTCAccountsStore = initCkBTCAccountsStore();
