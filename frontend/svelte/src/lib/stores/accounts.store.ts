import { writable } from "svelte/store";
import type { Account } from "../types/account";
import { loadAccounts } from "../utils/accounts.utils";
import type { AuthStore } from "./auth.store";

export interface AccountsStore {
  main: Account | undefined;
}

/**
 * A store that contains the account information.
 * - sync: load or reset the data
 * a. If no `principal` is provided to sync the account, for example on app init or after a sign-out, the data is set to undefined
 * b. If a `principal` is provided, e.g. after sign-in, then the information are loaded using the ledger and the nns dapp canister itself
 */
export const initAccountsStore = () => {
  const { subscribe, set } = writable<AccountsStore>({
    main: undefined,
  });

  return {
    subscribe,

    sync: async ({ principal }: AuthStore) => {
      if (!principal) {
        set(undefined);
        return;
      }

      const accounts: AccountsStore = await loadAccounts({ principal });
      set(accounts);
    },
  };
};

export const accountsStore = initAccountsStore();
