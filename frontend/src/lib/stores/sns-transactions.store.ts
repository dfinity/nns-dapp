import { removeKeys } from "$lib/utils/utils";
import type { Principal } from "@dfinity/principal";
import type { SnsTransactionWithId } from "@dfinity/sns";
import { writable } from "svelte/store";

export interface SnsTransactions {
  // Each SNS Account is an entry in this Store.
  // We use the account string representation as the key to identify the transactions.
  [accountIdentifier: string]: {
    transactions: SnsTransactionWithId[];
    oldestTxId?: bigint;
    completed: boolean;
  };
}

export interface SnsTransactionsStore {
  // Each SNS Project is an entry in this Store.
  // We use the root canister id and then the account identifier as the key to identify the transactions.
  [rootCanisterId: string]: SnsTransactions;
}

/**
 * A store that contains the transactions for each account in sns projects.
 *
 * - addTransactions: adds new transactions for a specific account in a specific sns project. If the state does not exist, it will be created.
 * - reset: reset the store to an empty state.
 * - resetProject: removed the transactions for a specific project.
 */
const initSnsTransactionsStore = () => {
  const { subscribe, update, set } = writable<SnsTransactionsStore>({});

  return {
    subscribe,

    addTransactions({
      accountIdentifier,
      rootCanisterId,
      transactions,
      oldestTxId,
      completed,
    }: {
      accountIdentifier: string;
      rootCanisterId: Principal;
      transactions: SnsTransactionWithId[];
      oldestTxId?: bigint;
      completed: boolean;
    }) {
      update((currentState: SnsTransactionsStore) => {
        const projectState = currentState[rootCanisterId.toText()];
        const accountState = projectState?.[accountIdentifier];
        const uniquePreviousTransactions = (
          accountState?.transactions ?? []
        ).filter(
          ({ id: oldTxId }) =>
            !transactions.some(({ id: newTxId }) => newTxId === oldTxId)
        );
        // Ids are in increasing order. We want to keep the oldest id.
        const newOldestTxId =
          oldestTxId === undefined
            ? accountState?.oldestTxId
            : oldestTxId <= (accountState?.oldestTxId ?? oldestTxId)
            ? oldestTxId
            : accountState?.oldestTxId;
        return {
          ...currentState,
          [rootCanisterId.toText()]: {
            ...projectState,
            [accountIdentifier]: {
              transactions: [...uniquePreviousTransactions, ...transactions],
              oldestTxId: newOldestTxId,
              completed,
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

export const snsTransactionsStore = initSnsTransactionsStore();
