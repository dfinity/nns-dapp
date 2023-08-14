import * as snsApi from "$lib/api/sns-ledger.api";
import { loadSnsTransactionFee } from "$lib/services/transaction-fees.services";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import { mockPrincipal, resetIdentity } from "$tests/mocks/auth.store.mock";
import { get } from "svelte/store";

describe("transactionFee-services", () => {
  const fee = BigInt(30_000);

  beforeEach(() => {
    resetIdentity();
  });

  describe("loadSnsTransactionFee", () => {
    describe("success", () => {
      let spyTransactionFeeApi;
      beforeEach(() => {
        spyTransactionFeeApi = jest
          .spyOn(snsApi, "transactionFee")
          .mockResolvedValue(fee);
        // Avoid to print errors during test
        jest.spyOn(console, "error").mockImplementation(() => undefined);
      });

      afterEach(() => {
        transactionsFeesStore.reset();
        jest.clearAllMocks();
      });

      it("set transaction fee of the sns project to the ledger canister value", async () => {
        await loadSnsTransactionFee({ rootCanisterId: mockPrincipal });

        expect(spyTransactionFeeApi).toHaveBeenCalled();

        const feesStore = get(transactionsFeesStore);
        const { fee: actualFee } = feesStore.projects[mockPrincipal.toText()];
        expect(actualFee).toEqual(fee);
      });

      it("it should not call api if the fee is in the store is certified", async () => {
        transactionsFeesStore.setFee({
          rootCanisterId: mockPrincipal,
          fee: BigInt(10_000),
          certified: true,
        });
        await loadSnsTransactionFee({ rootCanisterId: mockPrincipal });

        expect(spyTransactionFeeApi).not.toHaveBeenCalled();
      });

      it("it should call api if the fee is in the store is not certified", async () => {
        transactionsFeesStore.setFee({
          rootCanisterId: mockPrincipal,
          fee: BigInt(10_000),
          certified: false,
        });
        await loadSnsTransactionFee({ rootCanisterId: mockPrincipal });

        expect(spyTransactionFeeApi).toHaveBeenCalled();
      });
    });

    describe("error", () => {
      beforeEach(() => {
        // Avoid to print errors during test
        jest.spyOn(console, "error").mockImplementation(() => undefined);
      });

      it("should call error callback", async () => {
        const spyTransactionFeeApi = jest
          .spyOn(snsApi, "transactionFee")
          .mockRejectedValue(new Error());

        const spy = jest.fn();

        await loadSnsTransactionFee({
          rootCanisterId: mockPrincipal,
          handleError: spy,
        });

        expect(spy).toBeCalled();

        spyTransactionFeeApi.mockClear();
      });
    });
  });
});
