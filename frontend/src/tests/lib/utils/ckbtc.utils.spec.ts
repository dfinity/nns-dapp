import { RETRIEVE_BTC_MIN_AMOUNT } from "$lib/constants/bitcoin.constants";
import { E8S_PER_ICP } from "$lib/constants/icp.constants";
import { CkBTCErrorRetrieveBtcMinAmount } from "$lib/types/ckbtc.errors";
import { NotEnoughAmountError } from "$lib/types/common.errors";
import { assertCkBTCUserInputAmount } from "$lib/utils/ckbtc.utils";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { formatToken } from "$lib/utils/token.utils";
import { mockMainAccount } from "$tests/mocks/accounts.store.mock";
import en from "$tests/mocks/i18n.mock";

describe("ckbtc.utils", () => {
  const params = {
    networkBtc: true,
    sourceAccount: mockMainAccount,
    amount: 0.002,
    transactionFee: 1n,
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

  it.only("should throw error if amount is lower than min retrieve btc amount", () => {
    expect(() =>
      assertCkBTCUserInputAmount({
        ...params,
        amount: Number(RETRIEVE_BTC_MIN_AMOUNT) / E8S_PER_ICP - 0.00001,
      })
    ).toThrow(
      new CkBTCErrorRetrieveBtcMinAmount(
        replacePlaceholders(en.error__ckbtc.retrieve_btc_min_amount, {
          $amount: formatToken({
            value: RETRIEVE_BTC_MIN_AMOUNT,
            detailed: true,
          }),
        })
      )
    );
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
    ).toThrow(new NotEnoughAmountError("error.insufficient_funds"));
  });
});
