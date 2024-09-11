import type { ImportedTokenData } from "$lib/types/imported-tokens";
import { CanisterIdString } from "@dfinity/nns";
import { writable } from "svelte/store";

export interface ImportedTokensStore {
  importedTokens: ImportedTokenData[] | undefined;
  certified: boolean | undefined;
}

/**
 * A store that contains user imported tokens
 */
const initImportedTokensStore = () => {
  const { subscribe, set } = writable<ImportedTokensStore>({
    importedTokens: undefined,
    certified: undefined,
  });

  return {
    subscribe,

    set({
      importedTokens,
      certified,
    }: {
      importedTokens: ImportedTokenData[];
      certified: boolean;
    }) {
      set({
        importedTokens,
        certified,
      });
    },

    reset() {
      set({
        importedTokens: undefined,
        certified: undefined,
      });
    },
  };
};

export const importedTokensStore = initImportedTokensStore();

/**
 * A store that contains ledger canister IDs of imported tokens that failed to load
 */
const initFailedImportedTokenLedgerIdsStore = () => {
  const { subscribe, set, update } = writable<CanisterIdString[]>([]);

  return {
    subscribe,

    add(ledgerCanisterId: CanisterIdString) {
      update((failedLedgerCanisterIds) =>
        failedLedgerCanisterIds.includes(ledgerCanisterId)
          ? failedLedgerCanisterIds
          : [...failedLedgerCanisterIds, ledgerCanisterId]
      );
    },

    reset() {
      set([]);
    },
  };
};
export const failedImportedTokenLedgerIdsStore =
  initFailedImportedTokenLedgerIdsStore();
