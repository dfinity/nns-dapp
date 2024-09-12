import {
  failedImportedTokenLedgerIdsStore,
  importedTokensStore,
} from "$lib/stores/imported-tokens.store";
import { derived } from "svelte/store";

export const loadedImportedTokensStore = derived(
  [importedTokensStore, failedImportedTokenLedgerIdsStore],
  ([importedTokensStore, failedImportedTokenLedgerIds]) => {
    return (importedTokensStore.importedTokens ?? []).filter(
      ({ ledgerCanisterId }) =>
        !failedImportedTokenLedgerIds.includes(ledgerCanisterId.toText())
    );
  }
);
