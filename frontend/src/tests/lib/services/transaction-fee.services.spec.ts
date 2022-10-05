import { get } from "svelte/store";
import * as api from "../../../lib/api/ledger.api";
import * as snsApi from "../../../lib/api/sns-ledger.api";
import { DEFAULT_TRANSACTION_FEE_E8S } from "../../../lib/constants/icp.constants";
import {
  loadMainTransactionFee,
  loadSnsTransactionFee,
} from "../../../lib/services/transaction-fees.services";
import {
  mainTransactionFeeStore,
  transactionsFeesStore,
} from "../../../lib/stores/transaction-fees.store";
import {
  mockPrincipal,
  resetIdentity,
  setNoIdentity,
} from "../../mocks/auth.store.mock";

describe("transactionFee-services", () => {
  const fee = BigInt(30_000);

  describe("loadMainTransactionFee", () => {
    let spyTranactionFeeApi;
    beforeEach(() => {
      spyTranactionFeeApi = jest
        .spyOn(api, "transactionFee")
        .mockResolvedValue(fee);
      // Avoid to print errors during test
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });

    afterEach(() =>
      transactionsFeesStore.setMain(BigInt(DEFAULT_TRANSACTION_FEE_E8S))
    );

    it("set transaction fee to the ledger canister value", async () => {
      await loadMainTransactionFee();

      expect(spyTranactionFeeApi).toHaveBeenCalled();

      const storeFee = get(mainTransactionFeeStore);
      expect(storeFee).toEqual(Number(fee));
    });

    it("should not set new fee if no identity", async () => {
      setNoIdentity();

      await loadMainTransactionFee();

      const storeFee = get(mainTransactionFeeStore);
      expect(storeFee).toEqual(DEFAULT_TRANSACTION_FEE_E8S);

      resetIdentity();
    });
  });

  describe("loadSnsTransactionFee", () => {
    let spyTranactionFeeApi;
    beforeEach(() => {
      spyTranactionFeeApi = jest
        .spyOn(snsApi, "transactionFee")
        .mockResolvedValue(fee);
      // Avoid to print errors during test
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });

    afterEach(() =>
      transactionsFeesStore.setMain(BigInt(DEFAULT_TRANSACTION_FEE_E8S))
    );

    it("set transaction fee of the sns project to the ledger canister value", async () => {
      await loadSnsTransactionFee(mockPrincipal);

      expect(spyTranactionFeeApi).toHaveBeenCalled();

      const feesStore = get(transactionsFeesStore);
      const { fee: actualFee } = feesStore.projects[mockPrincipal.toText()];
      expect(actualFee).toEqual(fee);
      expect(spyTranactionFeeApi).toBeCalled();
    });
  });
});
