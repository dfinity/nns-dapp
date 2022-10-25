import { removeKeys } from "$lib/utils/utils";
import type { Principal } from "@dfinity/principal";
import type { SnsTransactionWithId } from "@dfinity/sns";
import { writable } from "svelte/store";

interface SnsTransactions {
  // Each SNS Account is an entry in this Store.
  // We use the account string representation as the key to identify the transactions.
  [accountIdentifier: string]: {
    transactions: SnsTransactionWithId[];
    oldestTxId: bigint;
  };
}

export interface SnsTransactionsStore {
  // Each SNS Project is an entry in this Store.
  // We use the root canister id and then the account identifier as the key to identify the transactions.
  [rootCanisterId: string]: SnsTransactions;
}

/**
 * A store that contains the sns accounts for each project.
 *
 * - setAccounts: replace the current list of accounts for a specific sns project with a new list.
 * - reset: reset the store to an empty state.
 * - resetProject: removed the accounts for a specific project.
 */
const initSnsAccountsStore = () => {
  const { subscribe, update, set } = writable<SnsTransactionsStore>({});

  return {
    subscribe,

    setAccounts({
      accountIdentifier,
      rootCanisterId,
      transactions,
      oldestTxId,
    }: {
      accountIdentifier: string;
      rootCanisterId: Principal;
      transactions: SnsTransactionWithId[];
      oldestTxId: bigint;
    }) {
      update((currentState: SnsTransactionsStore) => {
        const projectState = currentState[rootCanisterId.toText()];
        const accountState = projectState?.[accountIdentifier];
        const uniquePreviousTransactions = (
          accountState?.transactions ?? []
        ).filter(({ id: oldTxId }) =>
          transactions.some(({ id: newTxId }) => newTxId !== oldTxId)
        );
        return {
          ...currentState,
          [rootCanisterId.toText()]: {
            ...projectState,
            [accountIdentifier]: {
              transactions: [...uniquePreviousTransactions, ...transactions],
              oldestTxId,
            },
          },
        };
      });
    },

    // Used in tests
    reset() {
      set({});
    },

    resetProject(rootCanisterId: Principal) {
      update((currentState: SnsTransactionsStore) =>
        removeKeys({
          obj: currentState,
          keysToRemove: [rootCanisterId.toText()],
        })
      );
    },
  };
};

export const snsTransactionsStore = initSnsAccountsStore();
