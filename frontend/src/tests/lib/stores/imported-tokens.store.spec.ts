import { importedTokensStore } from "$lib/stores/imported-tokens.store";
import type { ImportedTokenData } from "$lib/types/imported-tokens";
import { principal } from "$tests/mocks/sns-projects.mock";
import { get } from "svelte/store";

describe("imported-tokens-store", () => {
  afterEach(() => importedTokensStore.reset());

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
});
