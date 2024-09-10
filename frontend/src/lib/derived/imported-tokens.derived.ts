import {
  failedImportedTokenLedgerIdsStore,
  importedTokensStore,
} from "$lib/stores/imported-tokens.store";
import { derived } from "svelte/store";

export const loadedImportedTokensStore = derived(
  [importedTokensStore, failedImportedTokenLedgerIdsStore],
  ([importedTokensStore, failedImportedTokensStore]) => {
    return (importedTokensStore.importedTokens ?? []).filter(
      ({ ledgerCanisterId }) =>
        !failedImportedTokensStore.some(
          (id) => id.toText() === ledgerCanisterId.toText()
        )
    );
  }
);
