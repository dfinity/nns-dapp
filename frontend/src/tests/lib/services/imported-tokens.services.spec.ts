import * as importedTokensApi from "$lib/api/imported-tokens.api";
import type { ImportedToken } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { loadImportedTokens } from "$lib/services/imported-tokens.services";
import { importedTokensStore } from "$lib/stores/imported-tokens.store";
import * as toastsStore from "$lib/stores/toasts.store";
import type { ImportedTokenData } from "$lib/types/imported-tokens";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { get } from "svelte/store";

describe("imported-tokens-services", () => {
  const importedTokenA: ImportedToken = {
    ledger_canister_id: principal(0),
    index_canister_id: [principal(1)],
  };
  const importedTokenDataA: ImportedTokenData = {
    ledgerCanisterId: principal(0),
    indexCanisterId: principal(1),
  };
  const importedTokenB: ImportedToken = {
    ledger_canister_id: principal(2),
    index_canister_id: [],
  };
  const importedTokenDataB: ImportedTokenData = {
    ledgerCanisterId: principal(2),
    indexCanisterId: undefined,
  };
  const testError = new Error("test");

  beforeEach(() => {
    vi.clearAllMocks();
    resetIdentity();
    importedTokensStore.reset();
    vi.spyOn(console, "error").mockReturnValue();
  });

  describe("loadImportedTokens", () => {
    it("should call getImportedTokens and load imported tokens in store", async () => {
      const spyGetImportedTokens = vi
        .spyOn(importedTokensApi, "getImportedTokens")
        .mockResolvedValue({
          imported_tokens: [importedTokenA, importedTokenB],
        });

      expect(spyGetImportedTokens).toBeCalledTimes(0);

      expect(get(importedTokensStore)).toEqual({
        importedTokens: undefined,
        certified: undefined,
      });

      await loadImportedTokens();

      expect(spyGetImportedTokens).toBeCalledTimes(2);
      expect(spyGetImportedTokens).toHaveBeenCalledWith({
        certified: false,
        identity: mockIdentity,
      });
      expect(spyGetImportedTokens).toHaveBeenCalledWith({
        certified: true,
        identity: mockIdentity,
      });
      expect(get(importedTokensStore)).toEqual({
        importedTokens: [importedTokenDataA, importedTokenDataB],
        certified: true,
      });
    });

    it("should display toast on error", async () => {
      const spyToastError = vi.spyOn(toastsStore, "toastsError");
      const spyGetImportedTokens = vi
        .spyOn(importedTokensApi, "getImportedTokens")
        .mockRejectedValue(testError);

      expect(spyGetImportedTokens).toBeCalledTimes(0);
      expect(spyToastError).not.toBeCalled();

      await loadImportedTokens();

      expect(spyToastError).toBeCalledTimes(1);
      expect(spyToastError).toBeCalledWith({
        labelKey: "error__imported_tokens.load_imported_tokens",
        err: testError,
      });
    });

    it("should reset store on error", async () => {
      vi.spyOn(importedTokensApi, "getImportedTokens").mockRejectedValue(
        testError
      );

      importedTokensStore.set({
        importedTokens: [importedTokenDataA],
        certified: true,
      });

      expect(get(importedTokensStore)).toEqual({
        importedTokens: [importedTokenDataA],
        certified: true,
      });

      await loadImportedTokens();

      expect(get(importedTokensStore)).toEqual({
        importedTokens: undefined,
        certified: undefined,
      });
    });
  });
});
