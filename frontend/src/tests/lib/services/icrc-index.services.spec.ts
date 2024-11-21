import * as icrcIndexApi from "$lib/api/icrc-index.api";
import { matchLedgerIndexPair } from "$lib/services/icrc-index.services";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { toastsStore } from "@dfinity/gix-components";
import { get } from "svelte/store";

describe("icrc-index.services", () => {
  describe("matchLedgerIndexPair", () => {
    const indexCanisterId = principal(0);
    const ledgerCanisterId = principal(1);
    const differentLedgerCanisterId = principal(11);

    beforeEach(() => {
      resetIdentity();
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
          text: `An error occurred while validating the index canister ID. It appears that ${indexCanisterId} might not be a valid index canister ID. ${error.message}`,
        },
      ]);
    });
  });
});
