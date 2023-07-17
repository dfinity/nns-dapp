import type { GetTransactionsResponse } from "$lib/api/icrc-index.api";
import type { IcrcAccountIdentifierText } from "$lib/types/icrc";
import type {
  UniverseCanisterId,
  UniverseCanisterIdText,
} from "$lib/types/universe";
import { removeKeys } from "$lib/utils/utils";
import type { IcrcTransactionWithId } from "@dfinity/ledger";
import type { Principal } from "@dfinity/principal";
import { nonNullish } from "@dfinity/utils";
import { writable, type Readable } from "svelte/store";

// Each Icrc Account - Sns or ckBTC - is an entry in this store.
// We use the account string representation as the key to identify the transactions.
export type IcrcTransactions = Record<
  IcrcAccountIdentifierText,
  {
    transactions: IcrcTransactionWithId[];
    oldestTxId?: bigint;
    completed: boolean;
  }
>;

// Each universe - except Nns - is an entry in this store.
// We use the root canister id and then the account identifier as the key to identify the transactions.
export type IcrcTransactionsStoreData = Record<
  UniverseCanisterIdText,
  IcrcTransactions
>;

export interface IcrcTransactionsStore
  extends Readable<IcrcTransactionsStoreData> {
  addTransactions: (
    data: {
      accountIdentifier: string;
      canisterId: UniverseCanisterId;
      completed: boolean;
    } & GetTransactionsResponse
  ) => void;
  reset: () => void;
  resetUniverse: (canisterId: UniverseCanisterId) => void;
  resetAccount: (params: {
    universeId: UniverseCanisterId;
    accountIdentifier: string;
  }) => void;
}

/**
 * A store that contains the transactions for each account in sns projects.
 *
 * - addTransactions: adds new transactions for a specific account in a specific sns project. If the state does not exist, it will be created.
 * - reset: reset the store to an empty state.
 * - resetProject: removed the transactions for a specific project.
 */
const initIcrcTransactionsStore = (): IcrcTransactionsStore => {
  const { subscribe, update, set } = writable<IcrcTransactionsStoreData>({});

  return {
    subscribe,

    addTransactions({
      accountIdentifier,
      canisterId,
      transactions,
      oldestTxId,
      completed,
    }: {
      accountIdentifier: string;
      canisterId: Principal;
      transactions: IcrcTransactionWithId[];
      oldestTxId?: bigint;
      completed: boolean;
    }) {
      update((currentState: IcrcTransactionsStoreData) => {
        const projectState = currentState[canisterId.toText()];
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
          [canisterId.toText()]: {
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

    resetUniverse(canisterId: UniverseCanisterId) {
      update((currentState: IcrcTransactionsStoreData) =>
        removeKeys({
          obj: currentState,
          keysToRemove: [canisterId.toText()],
        })
      );
    },

    resetAccount({
      universeId,
      accountIdentifier,
    }: {
      universeId: UniverseCanisterId;
      accountIdentifier: string;
    }) {
      update((currentState: IcrcTransactionsStoreData) => {
        const projectState = currentState[universeId.toText()];
        return {
          ...removeKeys({
            obj: currentState,
            keysToRemove: [universeId.toText()],
          }),
          ...(nonNullish(projectState) && {
            [universeId.toText()]: removeKeys({
              obj: projectState,
              keysToRemove: [accountIdentifier],
            }),
          }),
        };
      });
    },
  };
};

export const icrcTransactionsStore = initIcrcTransactionsStore();
