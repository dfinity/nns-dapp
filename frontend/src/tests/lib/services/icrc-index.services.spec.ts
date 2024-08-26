import * as icrcIndexApi from "$lib/api/icrc-index.api";
import { matchLedgerIndexPair } from "$lib/services/icrc-index.services";
import * as toastsStore from "$lib/stores/toasts.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { principal } from "$tests/mocks/sns-projects.mock";

describe("icrc-index.services", () => {
  describe("matchLedgerIndexPair", () => {
    const indexCanisterId = principal(0);
    const ledgerCanisterId = principal(1);
    const differentLedgerCanisterId = principal(11);

    beforeEach(() => {
      vi.clearAllMocks();
      resetIdentity();
    });

    it("should return true when the ledger canister IDs match", async () => {
      vi.spyOn(icrcIndexApi, "getLedgerId").mockResolvedValue(ledgerCanisterId);

      const result = await matchLedgerIndexPair({
        ledgerCanisterId,
        indexCanisterId,
      });

      expect(result).toEqual(true);
    });

    it("should return false when the ledger canister IDs don't match", async () => {
      const spyToastError = vi.spyOn(toastsStore, "toastsError");
      vi.spyOn(icrcIndexApi, "getLedgerId").mockResolvedValue(
        differentLedgerCanisterId
      );

      expect(spyToastError).not.toBeCalled();
      const result = await matchLedgerIndexPair({
        ledgerCanisterId,
        indexCanisterId,
      });

      expect(result).toEqual(false);
      expect(spyToastError).toBeCalledTimes(1);
      expect(spyToastError).toBeCalledWith({
        labelKey: "error.invalid_ledger_index_pair",
      });
    });

    it("should handle errors", async () => {
      vi.spyOn(console, "error").mockReturnValue();
      const spyToastError = vi.spyOn(toastsStore, "toastsError");
      const error = new Error("test");
      vi.spyOn(icrcIndexApi, "getLedgerId").mockRejectedValue(error);

      expect(spyToastError).not.toBeCalled();
      const result = await matchLedgerIndexPair({
        ledgerCanisterId,
        indexCanisterId,
      });

      expect(result).toEqual(false);
      expect(spyToastError).toBeCalledTimes(1);
      expect(spyToastError).toBeCalledWith({
        labelKey: "error.index_canister_validation",
        substitutions: {
          $indexCanister: indexCanisterId.toText(),
        },
        err: error,
      });
    });
  });
});
