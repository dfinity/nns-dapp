import * as icrcIndexApi from "$lib/api/icrc-index.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import { matchLedgerIndexPair } from "$lib/services/icrc-index.services";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { toastsStore } from "@dfinity/gix-components";
import { AnonymousIdentity } from "@icp-sdk/core/agent";
import { get } from "svelte/store";

describe("icrc-index.services", () => {
  describe("matchLedgerIndexPair", () => {
    const indexCanisterId = principal(0);
    const ledgerCanisterId = principal(1);
    const differentLedgerCanisterId = principal(11);
    const differentIndexCanisterId = principal(12);

    beforeEach(() => {
      resetIdentity();
    });

    describe("when the ledger names an index canister", () => {
      it("should return true when the ledger names the entered index canister", async () => {
        const spyOnQueryIcrcIndexPrincipal = vi
          .spyOn(icrcLedgerApi, "queryIcrcIndexPrincipal")
          .mockResolvedValue(indexCanisterId);
        // The index canister must not be asked at all in this case. Reject so
        // an unexpected call fails the test immediately, instead of falling
        // through to the real implementation.
        const spyOnGetLedgerId = vi
          .spyOn(icrcIndexApi, "getLedgerId")
          .mockRejectedValue(new Error("getLedgerId should not be called"));

        const result = await matchLedgerIndexPair({
          ledgerCanisterId,
          indexCanisterId,
        });

        expect(result).toEqual(true);
        expect(get(toastsStore)).toEqual([]);
        expect(spyOnQueryIcrcIndexPrincipal).toBeCalledTimes(1);
        expect(spyOnQueryIcrcIndexPrincipal).toBeCalledWith({
          certified: true,
          identity: new AnonymousIdentity(),
          canisterId: ledgerCanisterId,
        });
        // The index canister is the untrusted side of the pair, so it must not
        // be asked at all.
        expect(spyOnGetLedgerId).toBeCalledTimes(0);
      });

      it("should return false when the ledger names a different index canister", async () => {
        vi.spyOn(icrcLedgerApi, "queryIcrcIndexPrincipal").mockResolvedValue(
          differentIndexCanisterId
        );
        // The entered index canister claims the right ledger, but the ledger
        // disagrees.
        const spyOnGetLedgerId = vi
          .spyOn(icrcIndexApi, "getLedgerId")
          .mockResolvedValue(ledgerCanisterId);

        expect(get(toastsStore)).toEqual([]);
        const result = await matchLedgerIndexPair({
          ledgerCanisterId,
          indexCanisterId,
        });

        expect(result).toEqual(false);
        expect(get(toastsStore)).toMatchObject([
          {
            level: "error",
            text: "The provided index canister ID does not match the associated ledger canister ID.",
          },
        ]);
        expect(spyOnGetLedgerId).toBeCalledTimes(0);
      });
    });

    describe("when the ledger names no index canister", () => {
      beforeEach(() => {
        vi.spyOn(icrcLedgerApi, "queryIcrcIndexPrincipal").mockResolvedValue(
          undefined
        );
      });

      it("should return true when the ledger canister IDs match", async () => {
        const spyOnGetLedgerId = vi
          .spyOn(icrcIndexApi, "getLedgerId")
          .mockResolvedValue(ledgerCanisterId);

        expect(spyOnGetLedgerId).toBeCalledTimes(0);
        const result = await matchLedgerIndexPair({
          ledgerCanisterId,
          indexCanisterId,
        });

        expect(result).toEqual(true);
        expect(spyOnGetLedgerId).toBeCalledTimes(1);
        expect(spyOnGetLedgerId).toBeCalledWith({
          certified: true,
          identity: mockIdentity,
          indexCanisterId,
        });
      });

      it("should return false when the ledger canister IDs don't match", async () => {
        vi.spyOn(icrcIndexApi, "getLedgerId").mockResolvedValue(
          differentLedgerCanisterId
        );

        expect(get(toastsStore)).toEqual([]);
        const result = await matchLedgerIndexPair({
          ledgerCanisterId,
          indexCanisterId,
        });

        expect(result).toEqual(false);
        expect(get(toastsStore)).toMatchObject([
          {
            level: "error",
            text: "The provided index canister ID does not match the associated ledger canister ID.",
          },
        ]);
      });

      it("should handle errors", async () => {
        vi.spyOn(console, "error").mockReturnValue();
        const error = new Error("test");
        vi.spyOn(icrcIndexApi, "getLedgerId").mockRejectedValue(error);

        const result = await matchLedgerIndexPair({
          ledgerCanisterId,
          indexCanisterId,
        });

        expect(result).toEqual(false);
        expect(get(toastsStore)).toMatchObject([
          {
            level: "error",
            text: `An error occurred while validating the index canister ID. It appears that ${indexCanisterId} might not be a valid index canister ID.`,
          },
        ]);
      });
    });

    it("should handle errors of the ledger canister call", async () => {
      vi.spyOn(console, "error").mockReturnValue();
      const error = new Error("test");
      vi.spyOn(icrcLedgerApi, "queryIcrcIndexPrincipal").mockRejectedValue(
        error
      );
      // The index canister must not be asked at all in this case. Reject so
      // an unexpected call fails the test immediately, instead of falling
      // through to the real implementation.
      const spyOnGetLedgerId = vi
        .spyOn(icrcIndexApi, "getLedgerId")
        .mockRejectedValue(new Error("getLedgerId should not be called"));

      const result = await matchLedgerIndexPair({
        ledgerCanisterId,
        indexCanisterId,
      });

      expect(result).toEqual(false);
      // The failing call targets the ledger canister, so the message must
      // name the ledger, not the index canister.
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: `An error occurred while validating the ledger canister ID. It appears that ${ledgerCanisterId} might not be a valid ledger canister ID.`,
        },
      ]);
      expect(spyOnGetLedgerId).toBeCalledTimes(0);
    });
  });
});
