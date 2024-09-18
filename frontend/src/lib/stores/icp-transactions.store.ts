import type { IcpAccountIdentifierText } from "$lib/types/account";
import { getUniqueTransactions } from "$lib/utils/transactions.utils";
import { removeKeys } from "$lib/utils/utils";
import type { TransactionWithId } from "@dfinity/ledger-icp";
import { writable, type Readable } from "svelte/store";

// Each ICP Account is an entry in this store.
// We use the account identifier as the key to identify the transactions.
export type IcpTransactionsStoreData = Record<
  IcpAccountIdentifierText,
  {
    transactions: TransactionWithId[];
    oldestTxId?: bigint;
    completed: boolean;
  }
>;

export interface IcpTransactionsStore
  extends Readable<IcpTransactionsStoreData> {
  addTransactions: (data: {
    accountIdentifier: string;
    transactions: TransactionWithId[];
    oldestTxId?: bigint;
    completed: boolean;
  }) => void;
  reset: () => void;
  resetAccount: (params: { accountIdentifier: string }) => void;
}

/**
 * A store that contains the transactions for each ICP account.
 *
 * - addTransactions: adds new transactions for a specific account. If the state does not exist, it will be created.
 * - reset: reset the store to an empty state.
 * - resetAccount: removed the transactions for a specific account.
 */
const initIcpTransactionsStore = (): IcpTransactionsStore => {
  const { subscribe, update, set } = writable<IcpTransactionsStoreData>({});

  return {
    subscribe,

    addTransactions({
      accountIdentifier,
      transactions,
      oldestTxId,
      completed,
    }: {
      accountIdentifier: string;
      transactions: TransactionWithId[];
      oldestTxId?: bigint;
      completed: boolean;
    }) {
      update((currentState: IcpTransactionsStoreData) => {
        const accountState = currentState?.[accountIdentifier];
        const allTransactions = getUniqueTransactions([
          ...(accountState?.transactions ?? []),
          ...transactions,
        ]);
        // Ids are in increasing order. We want to keep the oldest id.
        const newOldestTxId =
          oldestTxId === undefined
            ? accountState?.oldestTxId
            : oldestTxId <= (accountState?.oldestTxId ?? oldestTxId)
              ? oldestTxId
              : accountState?.oldestTxId;
        return {
          ...currentState,
          [accountIdentifier]: {
            transactions: allTransactions,
            oldestTxId: newOldestTxId,
            completed,
          },
        };
      });
    },

    // Used in tests
    reset() {
      set({});
    },

    resetAccount({ accountIdentifier }: { accountIdentifier: string }) {
      update((currentState: IcpTransactionsStoreData) => ({
        ...removeKeys({
          obj: currentState,
          keysToRemove: [accountIdentifier],
        }),
      }));
    },
  };
};

export const icpTransactionsStore = initIcpTransactionsStore();
