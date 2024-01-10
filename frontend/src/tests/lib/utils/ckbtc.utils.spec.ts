import { CkBTCErrorRetrieveBtcMinAmount } from "$lib/types/ckbtc.errors";
import { NotEnoughAmountError } from "$lib/types/common.errors";
import { assertCkBTCUserInputAmount } from "$lib/utils/ckbtc.utils";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { formatTokenE8s, ulpsToNumber } from "$lib/utils/token.utils";
import { mockCkBTCToken } from "$tests/mocks/ckbtc-accounts.mock";
import { mockCkBTCMinterInfo } from "$tests/mocks/ckbtc-minter.mock";
import en from "$tests/mocks/i18n.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import {
  mockedConstants,
  resetMockedConstants,
} from "$tests/utils/mockable-constants.test-utils";

describe("ckbtc.utils", () => {
  const RETRIEVE_BTC_MIN_AMOUNT = 100_000n;

  const params = {
    networkBtc: true,
    sourceAccount: mockMainAccount,
    amount: 0.002,
    transactionFee: 1n,
    infoData: {
      info: {
        ...mockCkBTCMinterInfo,
        retrieve_btc_min_amount: RETRIEVE_BTC_MIN_AMOUNT,
      },
      certified: true,
    },
  };

  beforeEach(() => {
    resetMockedConstants();
  });

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
        amount:
          ulpsToNumber({
            ulps: RETRIEVE_BTC_MIN_AMOUNT,
            token: mockCkBTCToken,
          }) - 0.00001,
      })
    ).toThrow(
      new CkBTCErrorRetrieveBtcMinAmount(
        replacePlaceholders(en.error__ckbtc.retrieve_btc_min_amount, {
          $amount: formatTokenE8s({
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
        amount: ulpsToNumber({
          ulps:
            RETRIEVE_BTC_MIN_AMOUNT +
            params.transactionFee +
            params.sourceAccount.balanceUlps,
          token: mockCkBTCToken,
        }),
      })
    ).toThrow(new NotEnoughAmountError("error.insufficient_funds"));
  });

  it("should throw error if retrieve min btc is not defined", () => {
    expect(() =>
      assertCkBTCUserInputAmount({
        ...params,
        infoData: undefined,
      })
    ).toThrow(
      new NotEnoughAmountError(en.error__ckbtc.retrieve_btc_min_amount_unknown)
    );
  });

  it("should throw error if ckbtc info is not certified", () => {
    expect(() =>
      assertCkBTCUserInputAmount({
        ...params,
        infoData: {
          info: mockCkBTCMinterInfo,
          certified: false,
        },
      })
    ).toThrow(
      new NotEnoughAmountError(
        en.error__ckbtc.wait_ckbtc_info_parameters_certified
      )
    );
  });

  it("should not throw error if ckbtc info is not certified but call strategy is query", () => {
    mockedConstants.FORCE_CALL_STRATEGY = "query";

    expect(() =>
      assertCkBTCUserInputAmount({
        ...params,
        infoData: {
          info: mockCkBTCMinterInfo,
          certified: false,
        },
      })
    ).not.toThrow();
  });
});
