import { assertCkBTCUserInputAmount } from "$lib/utils/ckbtc.utils";
import { RETRIEVE_BTC_MIN_AMOUNT } from "../../../lib/constants/bitcoin.constants";
import { E8S_PER_ICP } from "../../../lib/constants/icp.constants";
import { mockMainAccount } from "../../mocks/accounts.store.mock";

describe("ckbtc.utils", () => {
  const params = {
    networkBtc: true,
    sourceAccount: mockMainAccount,
    amount: 0.002,
    bitcoinEstimatedFee: 1n,
    transactionFee: 2n,
  };

  it("should not throw error", () => {
    expect(() =>
      assertCkBTCUserInputAmount({
        ...params,
        networkBtc: false,
      })
    ).not.toThrow();

    expect(() =>
      assertCkBTCUserInputAmount({
        ...params,
        sourceAccount: undefined,
      })
    ).not.toThrow();

    expect(() =>
      assertCkBTCUserInputAmount({
        ...params,
        amount: undefined,
      })
    ).not.toThrow();

    expect(() =>
      assertCkBTCUserInputAmount({
        ...params,
        amount: 0,
      })
    ).not.toThrow();

    expect(() =>
      assertCkBTCUserInputAmount({
        ...params,
        amount: Number(RETRIEVE_BTC_MIN_AMOUNT),
      })
    ).not.toThrow();

    expect(() =>
      assertCkBTCUserInputAmount({
        ...params,
        amount: Number(RETRIEVE_BTC_MIN_AMOUNT) + 0.1,
      })
    ).not.toThrow();

    expect(() => assertCkBTCUserInputAmount(params)).not.toThrow();
  });

  it("should throw error if amount is lower than min retrieve btc amount", () => {
    expect(() =>
      assertCkBTCUserInputAmount({
        ...params,
        amount: Number(RETRIEVE_BTC_MIN_AMOUNT) / E8S_PER_ICP - 0.00001,
      })
    ).toThrow();
  });

  it("should throw error if not enough funds available", () => {
    expect(() =>
      assertCkBTCUserInputAmount({
        ...params,
        amount:
          Number(RETRIEVE_BTC_MIN_AMOUNT) / E8S_PER_ICP +
          Number(params.transactionFee) / E8S_PER_ICP +
          Number(params.sourceAccount.balance.toE8s()) / E8S_PER_ICP,
      })
    ).toThrow();

    expect(() =>
      assertCkBTCUserInputAmount({
        ...params,
        amount:
          Number(params.sourceAccount.balance.toE8s()) / E8S_PER_ICP -
          Number(params.bitcoinEstimatedFee) / E8S_PER_ICP -
          Number(params.transactionFee) / E8S_PER_ICP +
          0.01,
      })
    ).toThrow();
  });
});
