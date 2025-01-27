import {
  failedImportedTokenLedgerIdsStore,
  importedTokensStore,
} from "$lib/stores/imported-tokens.store";
import type { ImportedTokenData } from "$lib/types/imported-tokens";
import { principal } from "$tests/mocks/sns-projects.mock";
import { get } from "svelte/store";

describe("imported-tokens-store", () => {
  describe("importedTokensStore", () => {
    const importedTokenA: ImportedTokenData = {
      ledgerCanisterId: principal(0),
      indexCanisterId: principal(1),
    };
    const importedTokenB: ImportedTokenData = {
      ledgerCanisterId: principal(2),
      indexCanisterId: undefined,
    };

    it("should set imported tokens", () => {
      const importedTokens = [importedTokenA, importedTokenB];
      expect(get(importedTokensStore)).toEqual({
        importedTokens: undefined,
        certified: undefined,
      });

      importedTokensStore.set({ importedTokens, certified: true });

      expect(get(importedTokensStore)).toEqual({
        importedTokens,
        certified: true,
      });
    });

    it("should remove from imported tokens", () => {
      importedTokensStore.set({
        importedTokens: [importedTokenA, importedTokenB],
        certified: true,
      });
      expect(get(importedTokensStore)).toEqual({
        importedTokens: [importedTokenA, importedTokenB],
        certified: true,
      });

      importedTokensStore.remove(importedTokenA.ledgerCanisterId);
      expect(get(importedTokensStore)).toEqual({
        importedTokens: [importedTokenB],
        certified: true,
      });

      importedTokensStore.remove(importedTokenB.ledgerCanisterId);
      expect(get(importedTokensStore)).toEqual({
        importedTokens: [],
        certified: true,
      });
    });

    it("should reset imported tokens", () => {
      const importedTokens = [importedTokenA, importedTokenB];
      expect(get(importedTokensStore)).toEqual({
        importedTokens: undefined,
        certified: undefined,
      });

      importedTokensStore.set({ importedTokens, certified: true });

      expect(get(importedTokensStore)).toEqual({
        importedTokens,
        certified: true,
      });
      importedTokensStore.reset();

      expect(get(importedTokensStore)).toEqual({
        importedTokens: undefined,
        certified: undefined,
      });
    });
  });

  describe("failedImportedTokenLedgerIdsStore", () => {
    const canisterIdA = "aaaaa-aa";
    const canisterIdB = "bbbbb-bb";

    it("should add canister IDs", () => {
      expect(get(failedImportedTokenLedgerIdsStore)).toEqual([]);
      failedImportedTokenLedgerIdsStore.add(canisterIdA);
      expect(get(failedImportedTokenLedgerIdsStore)).toEqual([canisterIdA]);
      failedImportedTokenLedgerIdsStore.add(canisterIdB);
      expect(get(failedImportedTokenLedgerIdsStore)).toEqual([
        canisterIdA,
        canisterIdB,
      ]);
    });

    it("should remove by canister ID", () => {
      failedImportedTokenLedgerIdsStore.add(canisterIdA);
      failedImportedTokenLedgerIdsStore.add(canisterIdB);
      expect(get(failedImportedTokenLedgerIdsStore)).toEqual([
        canisterIdA,
        canisterIdB,
      ]);

      failedImportedTokenLedgerIdsStore.remove(canisterIdA);
      expect(get(failedImportedTokenLedgerIdsStore)).toEqual([canisterIdB]);

      failedImportedTokenLedgerIdsStore.remove(canisterIdB);
      expect(get(failedImportedTokenLedgerIdsStore)).toEqual([]);
    });

    it("should not add duplicates", () => {
      expect(get(failedImportedTokenLedgerIdsStore)).toEqual([]);
      failedImportedTokenLedgerIdsStore.add(canisterIdA);
      expect(get(failedImportedTokenLedgerIdsStore)).toEqual([canisterIdA]);
      failedImportedTokenLedgerIdsStore.add(canisterIdA);
      expect(get(failedImportedTokenLedgerIdsStore)).toEqual([canisterIdA]);
    });
  });
});
