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
import {
  failedImportedTokenLedgerIdsStore,
  importedTokensStore,
} from "$lib/stores/imported-tokens.store";
import type { ImportedTokenData } from "$lib/types/imported-tokens";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { busyStore, toastsStore } from "@dfinity/gix-components";
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
    failedImportedTokenLedgerIdsStore.reset();
    toastsStore.reset();
    busyStore.resetForTesting();
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
      expect(spyGetImportedTokens).toBeCalledWith({
        certified: false,
        identity: mockIdentity,
      });
      expect(spyGetImportedTokens).toBeCalledWith({
        certified: true,
        identity: mockIdentity,
      });
      expect(get(importedTokensStore)).toEqual({
        importedTokens: [importedTokenDataA, importedTokenDataB],
        certified: true,
      });
    });

    it("should display toast on error", async () => {
      const spyGetImportedTokens = vi
        .spyOn(importedTokensApi, "getImportedTokens")
        .mockRejectedValue(testError);

      expect(spyGetImportedTokens).toBeCalledTimes(0);
      expect(get(toastsStore)).toEqual([]);

      await loadImportedTokens();

      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "There was an unexpected issue while loading imported tokens. test",
        },
      ]);
    });

    it("should not display toast on uncertified error", async () => {
      vi.spyOn(importedTokensApi, "getImportedTokens").mockImplementation(
        async ({ certified }) => {
          if (!certified) {
            throw testError;
          }
          return {
            imported_tokens: [importedTokenA, importedTokenB],
          };
        }
      );

      expect(get(toastsStore)).toEqual([]);

      await loadImportedTokens();

      expect(get(toastsStore)).toEqual([]);
    });

    it("should reset store on error", async () => {
      vi.spyOn(importedTokensApi, "getImportedTokens").mockRejectedValue(
        testError
      );

      importedTokensStore.set({
        importedTokens: [importedTokenDataA],
        certified: true,
      });
      failedImportedTokenLedgerIdsStore.add(
        importedTokenDataA.ledgerCanisterId.toString()
      );

      expect(get(importedTokensStore)).toEqual({
        importedTokens: [importedTokenDataA],
        certified: true,
      });
      expect(get(failedImportedTokenLedgerIdsStore)).toEqual([
        importedTokenDataA.ledgerCanisterId.toText(),
      ]);

      await loadImportedTokens();

      expect(get(importedTokensStore)).toEqual({
        importedTokens: undefined,
        certified: undefined,
      });
      expect(get(failedImportedTokenLedgerIdsStore)).toEqual([]);
    });

    it("should handle ignoreAccountNotFoundError parameter (no error toast, no imported tokens)", async () => {
      const accountNotFoundError = new AccountNotFoundError("test");
      vi.spyOn(importedTokensApi, "getImportedTokens").mockRejectedValue(
        accountNotFoundError
      );
      importedTokensStore.set({
        importedTokens: [importedTokenDataA],
        certified: true,
      });
      failedImportedTokenLedgerIdsStore.add(
        importedTokenDataA.ledgerCanisterId.toString()
      );
      expect(get(toastsStore)).toEqual([]);
      expect(get(importedTokensStore)).toEqual({
        importedTokens: [importedTokenDataA],
        certified: true,
      });
      expect(get(failedImportedTokenLedgerIdsStore)).toEqual([
        importedTokenDataA.ledgerCanisterId.toText(),
      ]);

      // default = ignoreAccountNotFoundError: false
      await loadImportedTokens();
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "There was an unexpected issue while loading imported tokens. test",
        },
      ]);
      toastsStore.reset();
      expect(get(importedTokensStore)).toEqual({
        importedTokens: undefined,
        certified: undefined,
      });

      // ignoreAccountNotFoundError: true
      await loadImportedTokens({
        ignoreAccountNotFoundError: true,
      });
      expect(get(toastsStore)).toEqual([]);
      expect(get(importedTokensStore)).toEqual({
        importedTokens: [],
        certified: true,
      });
      expect(get(failedImportedTokenLedgerIdsStore)).toEqual([]);
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
      expect(spySetImportedTokens).toBeCalledWith({
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
      vi.spyOn(importedTokensApi, "setImportedTokens").mockRejectedValue(
        undefined
      );
      vi.spyOn(importedTokensApi, "getImportedTokens").mockResolvedValue({
        imported_tokens: [importedTokenA, importedTokenB],
      });
      expect(get(toastsStore)).toEqual([]);

      await addImportedToken({
        tokenToAdd: importedTokenDataB,
        importedTokens: [importedTokenDataA],
      });

      expect(get(toastsStore)).toMatchObject([
        {
          level: "success",
          text: "New token has been successfully imported!",
        },
      ]);
    });

    it("should display toast on error", async () => {
      vi.spyOn(importedTokensApi, "setImportedTokens").mockRejectedValue(
        testError
      );
      expect(get(toastsStore)).toEqual([]);

      const { success } = await addImportedToken({
        tokenToAdd: importedTokenDataB,
        importedTokens: [importedTokenDataA],
      });

      expect(success).toEqual(false);
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "There was an unexpected issue while importing the token. test",
        },
      ]);
    });

    it("should handle too many tokens errors", async () => {
      vi.spyOn(importedTokensApi, "setImportedTokens").mockRejectedValue(
        new TooManyImportedTokensError("too many tokens")
      );
      expect(get(toastsStore)).toEqual([]);

      const { success } = await addImportedToken({
        tokenToAdd: importedTokenDataB,
        importedTokens: [importedTokenDataA],
      });

      expect(success).toEqual(false);
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "You can't import more than 20 tokens.",
        },
      ]);
    });
  });

  describe("removeImportedTokens", () => {
    it("should call setImportedTokens with updated token list", async () => {
      const spySetImportedTokens = vi
        .spyOn(importedTokensApi, "setImportedTokens")
        .mockResolvedValue(undefined);
      importedTokensStore.set({
        importedTokens: [importedTokenDataA, importedTokenDataB],
        certified: true,
      });
      expect(spySetImportedTokens).toBeCalledTimes(0);

      const { success } = await removeImportedTokens(
        importedTokenDataA.ledgerCanisterId
      );

      expect(success).toEqual(true);
      expect(spySetImportedTokens).toBeCalledTimes(1);
      expect(spySetImportedTokens).toBeCalledWith({
        identity: mockIdentity,
        importedTokens: [importedTokenB],
      });
    });

    it("should display busy store", async () => {
      let resolveSetImportedTokens;
      const spyOnSetImportedTokens = vi
        .spyOn(importedTokensApi, "setImportedTokens")
        .mockImplementation(
          () =>
            new Promise<void>((resolve) => (resolveSetImportedTokens = resolve))
        );
      importedTokensStore.set({
        importedTokens: [importedTokenDataA, importedTokenDataB],
        certified: true,
      });
      expect(spyOnSetImportedTokens).toBeCalledTimes(0);
      expect(get(busyStore)).toEqual([]);

      removeImportedTokens(importedTokenDataA.ledgerCanisterId);
      await runResolvedPromises();

      expect(spyOnSetImportedTokens).toBeCalledTimes(1);
      expect(get(busyStore)).toEqual([
        {
          initiator: "import-token-removing",
          text: "Removing imported token...",
        },
      ]);

      resolveSetImportedTokens();
      await runResolvedPromises();

      expect(get(busyStore)).toEqual([]);
    });

    it("should update the store", async () => {
      vi.spyOn(importedTokensApi, "setImportedTokens").mockResolvedValue(
        undefined
      );
      importedTokensStore.set({
        importedTokens: [importedTokenDataA, importedTokenDataB],
        certified: true,
      });
      expect(get(importedTokensStore)).toEqual({
        importedTokens: [importedTokenDataA, importedTokenDataB],
        certified: true,
      });

      await removeImportedTokens(importedTokenDataA.ledgerCanisterId);

      expect(get(importedTokensStore)).toEqual({
        importedTokens: [importedTokenDataB],
        certified: true,
      });
    });

    it("should display success toast", async () => {
      vi.spyOn(importedTokensApi, "setImportedTokens").mockRejectedValue(
        undefined
      );
      importedTokensStore.set({
        importedTokens: [importedTokenDataA, importedTokenDataB],
        certified: true,
      });
      expect(get(toastsStore)).toEqual([]);
      await removeImportedTokens(importedTokenDataA.ledgerCanisterId);

      expect(get(toastsStore)).toMatchObject([
        {
          level: "success",
          text: "The token has been successfully removed!",
        },
      ]);
    });

    it("should display toast on error", async () => {
      vi.spyOn(importedTokensApi, "setImportedTokens").mockRejectedValue(
        testError
      );
      importedTokensStore.set({
        importedTokens: [importedTokenDataA, importedTokenDataB],
        certified: true,
      });
      expect(get(toastsStore)).toEqual([]);
      const { success } = await removeImportedTokens(
        importedTokenDataA.ledgerCanisterId
      );

      expect(success).toEqual(false);
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "There was an unexpected issue while removing the imported token. test",
        },
      ]);
    });
  });

  describe("addIndexCanister", () => {
    const indexCanisterId = principal(1);
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
      const expectedTokenB = {
        ...importedTokenB,
        index_canister_id: [indexCanisterId],
      };
      const expectedTokenDataB = {
        ...importedTokenDataB,
        indexCanisterId,
      };
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
      expect(spySetImportedTokens).toBeCalledWith({
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

      expect(get(toastsStore)).toEqual([]);

      await addIndexCanister({
        ledgerCanisterId: importedTokenDataB.ledgerCanisterId,
        indexCanisterId,
        importedTokens: [importedTokenDataA, importedTokenDataB],
      });

      expect(get(toastsStore)).toMatchObject([
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

      expect(get(toastsStore)).toEqual([]);

      const { success } = await addIndexCanister({
        ledgerCanisterId: importedTokenDataB.ledgerCanisterId,
        indexCanisterId,
        importedTokens: [importedTokenDataA, importedTokenDataB],
      });

      expect(success).toEqual(false);
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "There was an unexpected issue while updating the imported token. test",
        },
      ]);
    });
  });
});
