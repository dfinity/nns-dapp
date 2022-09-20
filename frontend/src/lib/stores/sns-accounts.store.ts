import type { Principal } from "@dfinity/principal";
import { writable } from "svelte/store";
import type { Account } from "../types/account";
import { removeKeys } from "../utils/utils";

interface SnsAccount {
  accounts: Account[];
  certified: boolean;
}

export interface SnsAccountsStore {
  // Each SNS Project is an entry in this Store.
  // We use the root canister id as the key to identify the accounts for a specific project.
  [rootCanisterId: string]: SnsAccount;
}

/**
 * A store that contains the sns accounts for each project.
 *
 * - setAccounts: replace the current list of accounts for a specific sns project with a new list.
 * - reset: reset the store to an empty state.
 * - resetProject: removed the accounts for a specific project.
 */
const initSnsAccountsStore = () => {
  const { subscribe, update, set } = writable<SnsAccountsStore>({});

  return {
    subscribe,

    setAccounts({
      rootCanisterId,
      accounts,
      certified,
    }: {
      rootCanisterId: Principal;
      accounts: Account[];
      certified: boolean;
    }) {
      update((currentState: SnsAccountsStore) => ({
        ...currentState,
        [rootCanisterId.toText()]: {
          accounts,
          certified,
        },
      }));
    },

    // Used in tests
    reset() {
      set({});
    },

    resetProject(rootCanisterId: Principal) {
      update((currentState: SnsAccountsStore) =>
        removeKeys({
          obj: currentState,
          keysToRemove: [rootCanisterId.toText()],
        })
      );
    },
  };
};

export const snsAccountsStore = initSnsAccountsStore();
