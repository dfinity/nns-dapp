import * as importedTokensApi from "$lib/api/imported-tokens.api";
import {
  AccountNotFoundError,
  TooManyImportedTokensError,
} from "$lib/canisters/nns-dapp/nns-dapp.errors";
import type { ImportedToken } from "$lib/canisters/nns-dapp/nns-dapp.types";
import {
  addImportedToken,
  addIndexCanister,
  loadImportedTokens,
  removeImportedTokens,
} from "$lib/services/imported-tokens.services";
import { importedTokensStore } from "$lib/stores/imported-tokens.store";
import * as toastsStore from "$lib/stores/toasts.store";
import type { ImportedTokenData } from "$lib/types/imported-tokens";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { toastsStore as toastsStoreEntry } from "@dfinity/gix-components";
import * as dfinityUtils from "@dfinity/utils";
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
    toastsStoreEntry.reset();
    vi.spyOn(console, "error").mockReturnValue();
    vi.spyOn(dfinityUtils, "createAgent").mockReturnValue(undefined);
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

    it("should handle ignoreAccountNotFoundError parameter (no error toast, no imported tokens)", async () => {
      const accountNotFoundError = new AccountNotFoundError("test");
      const spyToastError = vi.spyOn(toastsStore, "toastsError");
      vi.spyOn(importedTokensApi, "getImportedTokens").mockRejectedValue(
        accountNotFoundError
      );

      expect(spyToastError).toBeCalledTimes(0);
      expect(get(importedTokensStore)).toEqual({
        importedTokens: undefined,
        certified: undefined,
      });

      // default = ignoreAccountNotFoundError: false
      await loadImportedTokens();
      expect(spyToastError).toBeCalledTimes(1);
      expect(get(importedTokensStore)).toEqual({
        importedTokens: undefined,
        certified: undefined,
      });

      // ignoreAccountNotFoundError: true
      await loadImportedTokens({
        ignoreAccountNotFoundError: true,
      });
      expect(spyToastError).toBeCalledTimes(1);
      expect(get(importedTokensStore)).toEqual({
        importedTokens: [],
        certified: true,
      });
    });
  });

  describe("addImportedToken", () => {
    it("should call setImportedTokens with updated token list", async () => {
      const spySetImportedTokens = vi
        .spyOn(importedTokensApi, "setImportedTokens")
        .mockResolvedValue(undefined);
      expect(spySetImportedTokens).toBeCalledTimes(0);

      const { success } = await addImportedToken({
        tokenToAdd: importedTokenDataB,
        importedTokens: [importedTokenDataA],
      });

      expect(success).toEqual(true);
      expect(spySetImportedTokens).toBeCalledTimes(1);
      expect(spySetImportedTokens).toHaveBeenCalledWith({
        identity: mockIdentity,
        importedTokens: [importedTokenA, importedTokenB],
      });
    });

    it("should update the store", async () => {
      const spyGetImportedTokens = vi
        .spyOn(importedTokensApi, "getImportedTokens")
        .mockResolvedValue({
          imported_tokens: [importedTokenA, importedTokenB],
        });
      vi.spyOn(importedTokensApi, "setImportedTokens").mockResolvedValue(
        undefined
      );
      importedTokensStore.set({
        importedTokens: [importedTokenDataA],
        certified: true,
      });
      expect(spyGetImportedTokens).toBeCalledTimes(0);
      expect(get(importedTokensStore)).toEqual({
        importedTokens: [importedTokenDataA],
        certified: true,
      });

      await addImportedToken({
        tokenToAdd: importedTokenDataB,
        importedTokens: [importedTokenDataA],
      });

      expect(spyGetImportedTokens).toBeCalledTimes(2);
      expect(get(importedTokensStore)).toEqual({
        importedTokens: [importedTokenDataA, importedTokenDataB],
        certified: true,
      });
    });

    it("should display success toast", async () => {
      const spyToastSuccess = vi.spyOn(toastsStore, "toastsSuccess");
      vi.spyOn(importedTokensApi, "setImportedTokens").mockRejectedValue(
        undefined
      );
      vi.spyOn(importedTokensApi, "getImportedTokens").mockResolvedValue({
        imported_tokens: [importedTokenA, importedTokenB],
      });
      expect(spyToastSuccess).not.toBeCalled();

      await addImportedToken({
        tokenToAdd: importedTokenDataB,
        importedTokens: [importedTokenDataA],
      });

      expect(spyToastSuccess).toBeCalledTimes(1);
      expect(spyToastSuccess).toBeCalledWith({
        labelKey: "tokens.add_imported_token_success",
      });
    });

    it("should display toast on error", async () => {
      const spyToastError = vi.spyOn(toastsStore, "toastsError");
      vi.spyOn(importedTokensApi, "setImportedTokens").mockRejectedValue(
        testError
      );
      expect(spyToastError).not.toBeCalled();

      const { success } = await addImportedToken({
        tokenToAdd: importedTokenDataB,
        importedTokens: [importedTokenDataA],
      });

      expect(success).toEqual(false);
      expect(spyToastError).toBeCalledTimes(1);
      expect(spyToastError).toBeCalledWith({
        labelKey: "error__imported_tokens.add_imported_token",
        err: testError,
      });
    });

    it("should handle too many tokens errors", async () => {
      const spyToastError = vi.spyOn(toastsStore, "toastsError");
      vi.spyOn(importedTokensApi, "setImportedTokens").mockRejectedValue(
        new TooManyImportedTokensError("too many tokens")
      );
      expect(spyToastError).not.toBeCalled();

      const { success } = await addImportedToken({
        tokenToAdd: importedTokenDataB,
        importedTokens: [importedTokenDataA],
      });

      expect(success).toEqual(false);
      expect(spyToastError).toBeCalledTimes(1);
      expect(spyToastError).toBeCalledWith({
        labelKey: "error__imported_tokens.too_many",
        substitutions: { $limit: "20" },
      });
    });
  });

  describe("removeImportedTokens", () => {
    it("should call setImportedTokens with updated token list", async () => {
      const spySetImportedTokens = vi
        .spyOn(importedTokensApi, "setImportedTokens")
        .mockResolvedValue(undefined);
      expect(spySetImportedTokens).toBeCalledTimes(0);

      const { success } = await removeImportedTokens({
        tokensToRemove: [importedTokenDataA],
        importedTokens: [importedTokenDataA, importedTokenDataB],
      });

      expect(success).toEqual(true);
      expect(spySetImportedTokens).toBeCalledTimes(1);
      expect(spySetImportedTokens).toHaveBeenCalledWith({
        identity: mockIdentity,
        importedTokens: [importedTokenB],
      });
    });

    it("should remove multiple tokens", async () => {
      const spySetImportedTokens = vi
        .spyOn(importedTokensApi, "setImportedTokens")
        .mockResolvedValue(undefined);
      expect(spySetImportedTokens).toBeCalledTimes(0);

      const { success } = await removeImportedTokens({
        tokensToRemove: [importedTokenDataA, importedTokenDataB],
        importedTokens: [importedTokenDataA, importedTokenDataB],
      });

      expect(success).toEqual(true);
      expect(spySetImportedTokens).toBeCalledTimes(1);
      expect(spySetImportedTokens).toHaveBeenCalledWith({
        identity: mockIdentity,
        importedTokens: [],
      });
    });

    it("should update the store", async () => {
      const spyGetImportedTokens = vi
        .spyOn(importedTokensApi, "getImportedTokens")
        .mockResolvedValue({
          imported_tokens: [importedTokenB],
        });
      vi.spyOn(importedTokensApi, "setImportedTokens").mockResolvedValue(
        undefined
      );
      importedTokensStore.set({
        importedTokens: [importedTokenDataA, importedTokenDataB],
        certified: true,
      });
      expect(spyGetImportedTokens).toBeCalledTimes(0);
      expect(get(importedTokensStore)).toEqual({
        importedTokens: [importedTokenDataA, importedTokenDataB],
        certified: true,
      });

      await removeImportedTokens({
        tokensToRemove: [importedTokenDataA],
        importedTokens: [importedTokenDataA, importedTokenDataB],
      });

      expect(spyGetImportedTokens).toBeCalledTimes(2);
      expect(get(importedTokensStore)).toEqual({
        importedTokens: [importedTokenDataB],
        certified: true,
      });
    });

    it("should display success toast", async () => {
      const spyToastSuccess = vi.spyOn(toastsStore, "toastsSuccess");
      vi.spyOn(importedTokensApi, "setImportedTokens").mockRejectedValue(
        undefined
      );
      vi.spyOn(importedTokensApi, "getImportedTokens").mockResolvedValue({
        imported_tokens: [importedTokenB],
      });
      expect(spyToastSuccess).not.toBeCalled();

      await removeImportedTokens({
        tokensToRemove: [importedTokenDataA],
        importedTokens: [importedTokenDataA, importedTokenDataB],
      });

      expect(spyToastSuccess).toBeCalledTimes(1);
      expect(spyToastSuccess).toBeCalledWith({
        labelKey: "tokens.remove_imported_token_success",
      });
    });

    it("should display toast on error", async () => {
      const spyToastError = vi.spyOn(toastsStore, "toastsError");
      vi.spyOn(importedTokensApi, "setImportedTokens").mockRejectedValue(
        testError
      );
      expect(spyToastError).not.toBeCalled();

      const { success } = await removeImportedTokens({
        tokensToRemove: [importedTokenDataA],
        importedTokens: [importedTokenDataA, importedTokenDataB],
      });

      expect(success).toEqual(false);
      expect(spyToastError).toBeCalledTimes(1);
      expect(spyToastError).toBeCalledWith({
        labelKey: "error__imported_tokens.remove_imported_token",
        err: testError,
      });
    });
  });

  describe("addIndexCanister", () => {
    const indexCanisterId = principal(1);
    const expectedTokenB = {
      ...importedTokenB,
      index_canister_id: [indexCanisterId],
    };
    const expectedTokenDataB = {
      ...importedTokenDataB,
      indexCanisterId,
    };
    let spyGetImportedTokens;

    beforeEach(() => {
      spyGetImportedTokens = vi
        .spyOn(importedTokensApi, "getImportedTokens")
        .mockResolvedValue({
          imported_tokens: [
            importedTokenA,
            {
              ...importedTokenB,
              index_canister_id: [indexCanisterId],
            },
          ],
        });
    });

    it("should call setImportedTokens with updated token list", async () => {
      const spySetImportedTokens = vi
        .spyOn(importedTokensApi, "setImportedTokens")
        .mockResolvedValue(undefined);

      expect(importedTokenDataB.indexCanisterId).toBeUndefined();
      importedTokensStore.set({
        importedTokens: [importedTokenDataA, importedTokenDataB],
        certified: true,
      });
      expect(spySetImportedTokens).toBeCalledTimes(0);
      expect(spyGetImportedTokens).toBeCalledTimes(0);

      const { success } = await addIndexCanister({
        ledgerCanisterId: importedTokenDataB.ledgerCanisterId,
        indexCanisterId,
        importedTokens: [importedTokenDataA, importedTokenDataB],
      });
      expect(success).toEqual(true);
      expect(spySetImportedTokens).toBeCalledTimes(1);
      expect(spySetImportedTokens).toHaveBeenCalledWith({
        identity: mockIdentity,
        importedTokens: [importedTokenA, expectedTokenB],
      });
      expect(spySetImportedTokens).toBeCalledTimes(1);
      // should reload imported tokens to update the store
      expect(spyGetImportedTokens).toBeCalledTimes(2);
      expect(get(importedTokensStore)).toEqual({
        importedTokens: [importedTokenDataA, expectedTokenDataB],
        certified: true,
      });
    });

    it("should display success toast", async () => {
      vi.spyOn(importedTokensApi, "setImportedTokens").mockResolvedValue(
        undefined
      );

      expect(get(toastsStoreEntry)).toMatchObject([]);

      await addIndexCanister({
        ledgerCanisterId: importedTokenDataB.ledgerCanisterId,
        indexCanisterId,
        importedTokens: [importedTokenDataA, importedTokenDataB],
      });

      expect(get(toastsStoreEntry)).toMatchObject([
        {
          level: "success",
          text: "The token has been successfully updated!",
        },
      ]);
    });

    it("should display toast on error", async () => {
      vi.spyOn(importedTokensApi, "setImportedTokens").mockRejectedValue(
        new Error("test")
      );

      expect(get(toastsStoreEntry)).toMatchObject([]);

      const { success } = await addIndexCanister({
        ledgerCanisterId: importedTokenDataB.ledgerCanisterId,
        indexCanisterId,
        importedTokens: [importedTokenDataA, importedTokenDataB],
      });

      expect(success).toEqual(false);
      expect(get(toastsStoreEntry)).toMatchObject([
        {
          level: "error",
          text: "There was an unexpected issue while updating the imported token. test",
        },
      ]);
    });
  });
});
