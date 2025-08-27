import {
  failedImportedTokenLedgerIdsStore,
  importedTokensStore,
} from "$lib/stores/imported-tokens.store";
import { isImportantCkToken } from "$lib/utils/icrc-tokens.utils";
import { derived } from "svelte/store";

/**
 * A store that contains the existing ledger canister IDs of imported tokens that
 * failed to load metadata or balance.This solves the issue of an unsynchronized
 * failed list when a token is removed from the importedTokenStore but hasn’t yet
 * been deleted from the failed store.
 */
export const failedExistentImportedTokenLedgerIdsStore = derived(
  [importedTokensStore, failedImportedTokenLedgerIdsStore],
  ([importedTokensStore, failedImportedTokenLedgerIds]) => {
    return failedImportedTokenLedgerIds.filter((ledgerId) =>
      (importedTokensStore.importedTokens ?? []).some(
        ({ ledgerCanisterId }) => ledgerCanisterId.toText() === ledgerId
      )
    );
  }
);

export const loadedImportedTokensStore = derived(
  [importedTokensStore, failedExistentImportedTokenLedgerIdsStore],
  ([importedTokensStore, failedImportedTokenLedgerIds]) => {
    return (importedTokensStore.importedTokens ?? []).filter(
      ({ ledgerCanisterId }) =>
        !failedImportedTokenLedgerIds.includes(ledgerCanisterId.toText()) &&
        // To avoid confusion, the imported tokens should not include important CK tokens.
        !isImportantCkToken({ ledgerCanisterId })
    );
  }
);
