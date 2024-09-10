import { loadedImportedTokensStore } from "$lib/derived/imported-tokens.derived";
import {
  failedImportedTokenLedgerIdsStore,
  importedTokensStore,
} from "$lib/stores/imported-tokens.store";
import type { ImportedTokenData } from "$lib/types/imported-tokens";
import { principal } from "$tests/mocks/sns-projects.mock";
import { get } from "svelte/store";

describe("imported tokens derived stores", () => {
  beforeEach(() => {
    importedTokensStore.reset();
    failedImportedTokenLedgerIdsStore.reset();
  });

  describe("loadedImportedTokensStore", () => {
    const importedTokenA: ImportedTokenData = {
      ledgerCanisterId: principal(0),
      indexCanisterId: principal(1),
    };
    const importedTokenB: ImportedTokenData = {
      ledgerCanisterId: principal(2),
      indexCanisterId: undefined,
    };

    it("should contain imported tokens", () => {
      expect(get(loadedImportedTokensStore)).toEqual([]);
      importedTokensStore.set({
        importedTokens: [importedTokenA, importedTokenB],
        certified: true,
      });
      expect(get(loadedImportedTokensStore)).toEqual([
        importedTokenA,
        importedTokenB,
      ]);
    });

    it("should not contain failed tokens", () => {
      expect(get(loadedImportedTokensStore)).toEqual([]);
      importedTokensStore.set({
        importedTokens: [importedTokenA, importedTokenB],
        certified: true,
      });
      failedImportedTokenLedgerIdsStore.add(importedTokenA.ledgerCanisterId);
      expect(get(loadedImportedTokensStore)).toEqual([importedTokenB]);
    });
  });
});
