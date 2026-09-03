import * as importedTokensApi from "$lib/api/imported-tokens.api";
import {
  AccountNotFoundError,
  TooManyImportedTokensError,
} from "$lib/canisters/nns-dapp/nns-dapp.errors";
import type { ImportedToken } from "$lib/canisters/nns-dapp/nns-dapp.types";
import {
  addImportedToken,
  addIndexCanister,
  getCertifiedImportedTokens,
  loadImportedTokens,
  removeImportedTokens,
} from "$lib/services/imported-tokens.services";
import {
  failedImportedTokenLedgerIdsStore,
  importedTokensStore,
} from "$lib/stores/imported-tokens.store";
import type { ImportedTokenData } from "$lib/types/imported-tokens";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { mockedConstants } from "$tests/utils/mockable-constants.test-utils";
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
  // A token that only a query response holds.
  // It stands for a token that a single replica forged.
  const forgedToken: ImportedToken = {
    ledger_canister_id: principal(9),
    index_canister_id: [],
  };
  const forgedTokenData: ImportedTokenData = {
    ledgerCanisterId: principal(9),
    indexCanisterId: undefined,
  };
  const testError = new Error("test");

  // The certified response always lands after the query response in
  // production, because an update call runs consensus. Reproduce that order
  // here.
  const QUERY_RESPONSE_DELAY_MS = 0;
  const CERTIFIED_RESPONSE_DELAY_MS = 50;

  const delay = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // The query response holds a forged token. The certified response does not.
  const mockSlowCertifiedGetImportedTokens = (
    certifiedTokens: ImportedToken[]
  ) =>
    vi
      .spyOn(importedTokensApi, "getImportedTokens")
      .mockImplementation(async ({ certified }) => {
        if (certified) {
          await delay(CERTIFIED_RESPONSE_DELAY_MS);
          return { imported_tokens: certifiedTokens };
        }

        await delay(QUERY_RESPONSE_DELAY_MS);
        return { imported_tokens: [...certifiedTokens, forgedToken] };
      });

  beforeEach(() => {
    resetIdentity();
    vi.spyOn(console, "error").mockReturnValue();
    vi.spyOn(dfinityUtils, "createAgent").mockReturnValue(undefined);
    importedTokensStore.reset();
    failedImportedTokenLedgerIdsStore.reset();
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
          text: "There was an unexpected issue while loading imported tokens.",
        },
      ]);
    });

    it("should display no error toast when the caller asks for silent errors", async () => {
      vi.spyOn(importedTokensApi, "getImportedTokens").mockRejectedValue(
        testError
      );

      await loadImportedTokens({
        silentErrorMessages: true,
        strategy: "update",
      });

      expect(get(toastsStore)).toEqual([]);
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
          text: "There was an unexpected issue while loading imported tokens.",
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
      importedTokensStore.set({
        importedTokens: [importedTokenDataA],
        certified: true,
      });
      expect(spySetImportedTokens).toBeCalledTimes(0);

      const { success } = await addImportedToken({
        tokenToAdd: importedTokenDataB,
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
      });

      // The reload after a write uses the `"update"` strategy.
      expect(spyGetImportedTokens).toBeCalledTimes(1);
      expect(spyGetImportedTokens).toBeCalledWith({
        certified: true,
        identity: mockIdentity,
      });
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
      importedTokensStore.set({
        importedTokens: [importedTokenDataA],
        certified: true,
      });
      expect(get(toastsStore)).toEqual([]);

      await addImportedToken({
        tokenToAdd: importedTokenDataB,
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
      importedTokensStore.set({
        importedTokens: [importedTokenDataA],
        certified: true,
      });
      expect(get(toastsStore)).toEqual([]);

      const { success } = await addImportedToken({
        tokenToAdd: importedTokenDataB,
      });

      expect(success).toEqual(false);
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "There was an unexpected issue while importing the token.",
        },
      ]);
    });

    it("should handle too many tokens errors", async () => {
      vi.spyOn(importedTokensApi, "setImportedTokens").mockRejectedValue(
        new TooManyImportedTokensError("too many tokens")
      );
      importedTokensStore.set({
        importedTokens: [importedTokenDataA],
        certified: true,
      });
      expect(get(toastsStore)).toEqual([]);

      const { success } = await addImportedToken({
        tokenToAdd: importedTokenDataB,
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
          text: "There was an unexpected issue while removing the imported token.",
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
      });
      expect(success).toEqual(true);
      expect(spySetImportedTokens).toBeCalledTimes(1);
      expect(spySetImportedTokens).toBeCalledWith({
        identity: mockIdentity,
        importedTokens: [importedTokenA, expectedTokenB],
      });
      expect(spySetImportedTokens).toBeCalledTimes(1);
      // should reload imported tokens to update the store
      // The reload after a write uses the `"update"` strategy.
      expect(spyGetImportedTokens).toBeCalledTimes(1);
      expect(spyGetImportedTokens).toBeCalledWith({
        certified: true,
        identity: mockIdentity,
      });
      expect(get(importedTokensStore)).toEqual({
        importedTokens: [importedTokenDataA, expectedTokenDataB],
        certified: true,
      });
    });

    it("should display success toast", async () => {
      vi.spyOn(importedTokensApi, "setImportedTokens").mockResolvedValue(
        undefined
      );
      importedTokensStore.set({
        importedTokens: [importedTokenDataA, importedTokenDataB],
        certified: true,
      });

      expect(get(toastsStore)).toEqual([]);

      await addIndexCanister({
        ledgerCanisterId: importedTokenDataB.ledgerCanisterId,
        indexCanisterId,
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
      importedTokensStore.set({
        importedTokens: [importedTokenDataA, importedTokenDataB],
        certified: true,
      });

      expect(get(toastsStore)).toEqual([]);

      const { success } = await addIndexCanister({
        ledgerCanisterId: importedTokenDataB.ledgerCanisterId,
        indexCanisterId,
      });

      expect(success).toEqual(false);
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "There was an unexpected issue while updating the imported token.",
        },
      ]);
    });
  });

  describe("getCertifiedImportedTokens", () => {
    it("should return the tokens without reloading when the store is certified", async () => {
      importedTokensStore.set({
        importedTokens: [importedTokenDataA],
        certified: true,
      });
      const spyGetImportedTokens = vi.spyOn(
        importedTokensApi,
        "getImportedTokens"
      );

      expect(await getCertifiedImportedTokens()).toEqual([importedTokenDataA]);
      expect(spyGetImportedTokens).toBeCalledTimes(0);
    });

    it("should discard an uncertified snapshot and return the certified tokens", async () => {
      // The store holds a query response with a forged token.
      importedTokensStore.set({
        importedTokens: [importedTokenDataA, forgedTokenData],
        certified: false,
      });
      mockSlowCertifiedGetImportedTokens([importedTokenA]);

      expect(await getCertifiedImportedTokens()).toEqual([importedTokenDataA]);
      expect(get(importedTokensStore)).toEqual({
        importedTokens: [importedTokenDataA],
        certified: true,
      });
    });

    it("should reload with the update strategy and make no query call", async () => {
      importedTokensStore.set({
        importedTokens: [importedTokenDataA, forgedTokenData],
        certified: false,
      });
      const spyGetImportedTokens = mockSlowCertifiedGetImportedTokens([
        importedTokenA,
      ]);

      await getCertifiedImportedTokens();

      expect(spyGetImportedTokens).toBeCalledTimes(1);
      expect(spyGetImportedTokens).toBeCalledWith({
        certified: true,
        identity: mockIdentity,
      });
    });

    it("should return undefined when the reload fails", async () => {
      importedTokensStore.set({
        importedTokens: [forgedTokenData],
        certified: false,
      });
      vi.spyOn(importedTokensApi, "getImportedTokens").mockRejectedValue(
        testError
      );

      expect(await getCertifiedImportedTokens()).toBeUndefined();
    });

    it("should show no toast when the reload fails", async () => {
      // The caller shows one message for the whole failed write. The reload
      // must not add a second toast.
      importedTokensStore.set({
        importedTokens: [forgedTokenData],
        certified: false,
      });
      vi.spyOn(importedTokensApi, "getImportedTokens").mockRejectedValue(
        testError
      );

      expect(get(toastsStore)).toHaveLength(0);

      await getCertifiedImportedTokens();

      expect(get(toastsStore)).toHaveLength(0);
    });

    it("should return undefined when the imported tokens were never loaded", async () => {
      vi.spyOn(importedTokensApi, "getImportedTokens").mockRejectedValue(
        testError
      );

      expect(await getCertifiedImportedTokens()).toBeUndefined();
    });

    it("should reload with the update strategy when the session forces the query strategy", async () => {
      // A forced-query session never gets certified data from its own loads.
      // A write must still build on certified tokens, so it makes one update
      // call of its own.
      mockedConstants.FORCE_CALL_STRATEGY = "query";

      importedTokensStore.set({
        importedTokens: [importedTokenDataA, forgedTokenData],
        certified: false,
      });
      const spyGetImportedTokens = mockSlowCertifiedGetImportedTokens([
        importedTokenA,
      ]);

      expect(await getCertifiedImportedTokens()).toEqual([importedTokenDataA]);

      expect(spyGetImportedTokens).toBeCalledTimes(1);
      expect(spyGetImportedTokens).toBeCalledWith({
        certified: true,
        identity: mockIdentity,
      });
    });
  });

  describe("certified data", () => {
    it("should not write back an uncertified snapshot when removing", async () => {
      // The store holds a query response with a forged token.
      importedTokensStore.set({
        importedTokens: [
          importedTokenDataA,
          importedTokenDataB,
          forgedTokenData,
        ],
        certified: false,
      });
      // The certified response drops the forged token, and it lands last.
      mockSlowCertifiedGetImportedTokens([importedTokenA, importedTokenB]);
      const spySetImportedTokens = vi
        .spyOn(importedTokensApi, "setImportedTokens")
        .mockResolvedValue(undefined);

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

    it("should not write an empty list when the store is reset and removing", async () => {
      importedTokensStore.reset();
      vi.spyOn(importedTokensApi, "getImportedTokens").mockRejectedValue(
        testError
      );
      const spySetImportedTokens = vi
        .spyOn(importedTokensApi, "setImportedTokens")
        .mockResolvedValue(undefined);

      const { success } = await removeImportedTokens(
        importedTokenDataA.ledgerCanisterId
      );

      expect(success).toEqual(false);
      expect(spySetImportedTokens).toBeCalledTimes(0);
      // The failed reload shows no toast of its own. The caller shows one
      // message for the whole failed write.
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: en.error__imported_tokens.not_certified,
        },
      ]);
    });

    it("should remove a token while the store holds a query response", async () => {
      // The store holds the query response of a fresh load. The certified
      // response is still on its way. The remove must still go through.
      importedTokensStore.set({
        importedTokens: [importedTokenDataA, importedTokenDataB],
        certified: false,
      });
      mockSlowCertifiedGetImportedTokens([importedTokenA, importedTokenB]);
      const spySetImportedTokens = vi
        .spyOn(importedTokensApi, "setImportedTokens")
        .mockResolvedValue(undefined);

      const { success } = await removeImportedTokens(
        importedTokenDataA.ledgerCanisterId
      );

      expect(success).toEqual(true);
      expect(spySetImportedTokens).toBeCalledTimes(1);
      expect(spySetImportedTokens).toBeCalledWith({
        identity: mockIdentity,
        importedTokens: [importedTokenB],
      });
      expect(get(toastsStore)).toMatchObject([
        {
          level: "success",
          text: "The token has been successfully removed!",
        },
      ]);
    });

    it("should not write the query snapshot when the session forces the query strategy", async () => {
      // The store holds a query response with a forged token, and the session
      // never makes an update call of its own. The remove must still build on
      // certified tokens.
      mockedConstants.FORCE_CALL_STRATEGY = "query";

      importedTokensStore.set({
        importedTokens: [
          importedTokenDataA,
          importedTokenDataB,
          forgedTokenData,
        ],
        certified: false,
      });
      mockSlowCertifiedGetImportedTokens([importedTokenA, importedTokenB]);
      const spySetImportedTokens = vi
        .spyOn(importedTokensApi, "setImportedTokens")
        .mockResolvedValue(undefined);

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

    it("should not remove a token that the certified list does not hold", async () => {
      // The query response holds a forged token that the certified list omits.
      importedTokensStore.set({
        importedTokens: [importedTokenDataA, forgedTokenData],
        certified: false,
      });
      vi.spyOn(importedTokensApi, "getImportedTokens").mockResolvedValue({
        imported_tokens: [importedTokenA],
      });
      const spySetImportedTokens = vi
        .spyOn(importedTokensApi, "setImportedTokens")
        .mockResolvedValue(undefined);

      const { success } = await removeImportedTokens(
        forgedTokenData.ledgerCanisterId
      );

      expect(success).toEqual(false);
      expect(spySetImportedTokens).toBeCalledTimes(0);
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: en.error__imported_tokens.token_not_found,
        },
      ]);
    });

    it("should not write back an uncertified snapshot when adding", async () => {
      importedTokensStore.set({
        importedTokens: [forgedTokenData],
        certified: false,
      });
      mockSlowCertifiedGetImportedTokens([importedTokenA]);
      const spySetImportedTokens = vi
        .spyOn(importedTokensApi, "setImportedTokens")
        .mockResolvedValue(undefined);

      const { success } = await addImportedToken({
        tokenToAdd: importedTokenDataB,
      });

      expect(success).toEqual(true);
      expect(spySetImportedTokens).toBeCalledWith({
        identity: mockIdentity,
        importedTokens: [importedTokenA, importedTokenB],
      });
    });

    it("should not add a token when certified data is not available", async () => {
      importedTokensStore.reset();
      vi.spyOn(importedTokensApi, "getImportedTokens").mockRejectedValue(
        testError
      );
      const spySetImportedTokens = vi
        .spyOn(importedTokensApi, "setImportedTokens")
        .mockResolvedValue(undefined);

      const { success } = await addImportedToken({
        tokenToAdd: importedTokenDataB,
      });

      expect(success).toEqual(false);
      expect(spySetImportedTokens).toBeCalledTimes(0);
      // The failed reload shows no toast of its own. The caller shows one
      // message for the whole failed write.
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: en.error__imported_tokens.not_certified,
        },
      ]);
    });

    it("should not add a token that the certified list already holds", async () => {
      importedTokensStore.set({
        importedTokens: [importedTokenDataA, importedTokenDataB],
        certified: true,
      });
      const spySetImportedTokens = vi
        .spyOn(importedTokensApi, "setImportedTokens")
        .mockResolvedValue(undefined);

      const { success } = await addImportedToken({
        tokenToAdd: importedTokenDataB,
      });

      expect(success).toEqual(false);
      expect(spySetImportedTokens).toBeCalledTimes(0);
      expect(get(toastsStore)).toMatchObject([
        {
          level: "warn",
          text: en.error__imported_tokens.is_duplication,
        },
      ]);
    });

    it("should not write back an uncertified snapshot when adding an index canister", async () => {
      const indexCanisterId = principal(3);
      importedTokensStore.set({
        importedTokens: [
          importedTokenDataA,
          importedTokenDataB,
          forgedTokenData,
        ],
        certified: false,
      });
      mockSlowCertifiedGetImportedTokens([importedTokenA, importedTokenB]);
      const spySetImportedTokens = vi
        .spyOn(importedTokensApi, "setImportedTokens")
        .mockResolvedValue(undefined);

      const { success } = await addIndexCanister({
        ledgerCanisterId: importedTokenDataB.ledgerCanisterId,
        indexCanisterId,
      });

      expect(success).toEqual(true);
      expect(spySetImportedTokens).toBeCalledWith({
        identity: mockIdentity,
        importedTokens: [
          importedTokenA,
          { ...importedTokenB, index_canister_id: [indexCanisterId] },
        ],
      });
    });

    it("should not add an index canister when certified data is not available", async () => {
      importedTokensStore.reset();
      vi.spyOn(importedTokensApi, "getImportedTokens").mockRejectedValue(
        testError
      );
      const spySetImportedTokens = vi
        .spyOn(importedTokensApi, "setImportedTokens")
        .mockResolvedValue(undefined);

      const { success } = await addIndexCanister({
        ledgerCanisterId: importedTokenDataB.ledgerCanisterId,
        indexCanisterId: principal(3),
      });

      expect(success).toEqual(false);
      expect(spySetImportedTokens).toBeCalledTimes(0);
      // The failed reload shows no toast of its own. The caller shows one
      // message for the whole failed write.
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: en.error__imported_tokens.not_certified,
        },
      ]);
    });

    it("should not add an index canister to a token that the certified list does not hold", async () => {
      importedTokensStore.set({
        importedTokens: [importedTokenDataA, forgedTokenData],
        certified: false,
      });
      vi.spyOn(importedTokensApi, "getImportedTokens").mockResolvedValue({
        imported_tokens: [importedTokenA],
      });
      const spySetImportedTokens = vi
        .spyOn(importedTokensApi, "setImportedTokens")
        .mockResolvedValue(undefined);

      const { success } = await addIndexCanister({
        ledgerCanisterId: forgedTokenData.ledgerCanisterId,
        indexCanisterId: principal(3),
      });

      expect(success).toEqual(false);
      expect(spySetImportedTokens).toBeCalledTimes(0);
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: en.error__imported_tokens.token_not_found,
        },
      ]);
    });
  });
});
