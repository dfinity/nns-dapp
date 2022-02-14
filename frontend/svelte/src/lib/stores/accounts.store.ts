import { writable } from "svelte/store";
import { createSubAccount, loadAccounts } from "../services/accounts.services";
import type { Account } from "../types/account";
import type { AuthStore } from "./auth.store";

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

    // TODO(L2-206): refactor pattern - extract "sync" logic to same module as "loadAccounts" and set the store value from there. Follow new proposals pattern.
    sync: async ({ principal }: AuthStore) => {
      if (!principal) {
        set(undefined);
        return;
      }

      const accounts: AccountsStore = await loadAccounts({ principal });
      set(accounts);
    },

    createSubAccount: async (subAccountName: string): Promise<void> => {
      const newAccount = await createSubAccount({ subAccountName });
      update((state) => ({
        ...state,
        subAccounts: [newAccount, ...state.subAccounts],
      }));
    },
  };
};

export const accountsStore = initAccountsStore();
