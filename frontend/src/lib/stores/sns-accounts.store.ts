import type { Account } from "$lib/types/account";
import type { RootCanisterIdText } from "$lib/types/sns";
import { removeKeys } from "$lib/utils/utils";
import type { Principal } from "@dfinity/principal";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";

interface SnsAccount {
  accounts: Account[];
  certified: boolean;
}

// Each SNS Project is an entry in this Store.
// We use the root canister id as the key to identify the accounts for a specific project.
export type SnsAccountsStoreData = Record<RootCanisterIdText, SnsAccount>;

export interface SnsAccountsStore extends Readable<SnsAccountsStoreData> {
  setAccounts: (data: {
    rootCanisterId: Principal;
    accounts: Account[];
    certified: boolean;
  }) => void;
  updateAccounts: (data: {
    rootCanisterId: Principal;
    accounts: Account[];
    certified: boolean;
  }) => void;
  resetProject: (rootCanisterId: Principal) => void;
  reset: () => void;
}

// TODO: we can maybe replace this store with icrcAccountStore?

/**
 * A store that contains the sns accounts for each project.
 *
 * - setAccounts: replace the current list of accounts for a specific sns project with a new list.
 * - reset: reset the store to an empty state.
 * - resetProject: removed the accounts for a specific project.
 */
const initSnsAccountsStore = (): SnsAccountsStore => {
  const initialEmptyStoreData: SnsAccountsStoreData = {} as const;

  const { subscribe, update, set } = writable<SnsAccountsStoreData>(
    initialEmptyStoreData
  );

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
      update((currentState: SnsAccountsStoreData) => ({
        ...currentState,
        [rootCanisterId.toText()]: {
          accounts,
          certified,
        },
      }));
    },

    updateAccounts({
      rootCanisterId,
      accounts,
      certified,
    }: {
      rootCanisterId: Principal;
      accounts: Account[];
      certified: boolean;
    }) {
      update((currentState: SnsAccountsStoreData) => ({
        ...currentState,
        [rootCanisterId.toText()]: {
          accounts: [
            ...(currentState[rootCanisterId.toText()]?.accounts ?? []).filter(
              ({ identifier }) =>
                accounts.find(({ identifier: i }) => identifier === i) ===
                undefined
            ),
            ...accounts,
          ],
          certified,
        },
      }));
    },

    // Used in tests
    reset() {
      set(initialEmptyStoreData);
    },

    resetProject(rootCanisterId: Principal) {
      update((currentState: SnsAccountsStoreData) =>
        removeKeys({
          obj: currentState,
          keysToRemove: [rootCanisterId.toText()],
        })
      );
    },
  };
};

export const snsAccountsStore = initSnsAccountsStore();
