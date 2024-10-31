import {
  failedExistentImportedTokenLedgerIdsStore,
  loadedImportedTokensStore,
} from "$lib/derived/imported-tokens.derived";
import {
  failedImportedTokenLedgerIdsStore,
  importedTokensStore,
} from "$lib/stores/imported-tokens.store";
import type { ImportedTokenData } from "$lib/types/imported-tokens";
import { principal } from "$tests/mocks/sns-projects.mock";
import { get } from "svelte/store";

describe("imported tokens derived stores", () => {
  const importedTokenA: ImportedTokenData = {
    ledgerCanisterId: principal(0),
    indexCanisterId: principal(1),
  };
  const importedTokenB: ImportedTokenData = {
    ledgerCanisterId: principal(2),
    indexCanisterId: undefined,
  };

  beforeEach(() => {
    importedTokensStore.reset();
    failedImportedTokenLedgerIdsStore.reset();
  });

  describe("failedExistentImportedTokenLedgerIdsStore", () => {
    it("should contain failed imported tokens", () => {
      expect(get(failedExistentImportedTokenLedgerIdsStore)).toEqual([]);
      importedTokensStore.set({
        importedTokens: [importedTokenA, importedTokenB],
        certified: true,
      });
      failedImportedTokenLedgerIdsStore.add(
        importedTokenA.ledgerCanisterId.toText()
      );
      expect(get(failedExistentImportedTokenLedgerIdsStore)).toEqual([
        importedTokenA.ledgerCanisterId.toText(),
      ]);
    });

    it("should not contain IDs if they are not in imported tokens store", () => {
      expect(get(failedExistentImportedTokenLedgerIdsStore)).toEqual([]);
      importedTokensStore.set({
        importedTokens: [importedTokenA, importedTokenB],
        certified: true,
      });
      failedImportedTokenLedgerIdsStore.add(
        importedTokenA.ledgerCanisterId.toText()
      );
      failedImportedTokenLedgerIdsStore.add(
        importedTokenB.ledgerCanisterId.toText()
      );
      expect(get(failedExistentImportedTokenLedgerIdsStore)).toEqual([
        importedTokenA.ledgerCanisterId.toText(),
        importedTokenB.ledgerCanisterId.toText(),
      ]);

      // remove tokenA
      importedTokensStore.remove(importedTokenA.ledgerCanisterId);
      expect(get(failedExistentImportedTokenLedgerIdsStore)).toEqual([
        importedTokenB.ledgerCanisterId.toText(),
      ]);
    });
  });

  describe("loadedImportedTokensStore", () => {
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
      failedImportedTokenLedgerIdsStore.add(
        importedTokenA.ledgerCanisterId.toText()
      );
      expect(get(loadedImportedTokensStore)).toEqual([importedTokenB]);
    });
  });
});
