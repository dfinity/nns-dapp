import {
  LEDGER_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import { DEFAULT_TRANSACTION_FEE_E8S } from "$lib/constants/icp.constants";
import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import { UserTokenAction, type UserToken } from "$lib/types/tokens-page";
import { buildWalletUrl } from "$lib/utils/navigation.utils";
import {
  convertIcpToTCycles,
  convertTCyclesToIcpNumber,
  formatTokenE8s,
  formatTokenV2,
  formattedTransactionFeeICP,
  getMaxTransactionAmount,
  numberToE8s,
  numberToUlps,
  sortUserTokens,
  sumAmounts,
  toTokenAmountV2,
  ulpsToNumber,
} from "$lib/utils/token.utils";
import { mockCkETHToken } from "$tests/mocks/cketh-accounts.mock";
import { mockSubAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { icpTokenBase } from "$tests/mocks/tokens-page.mock";
import { nnsUniverseMock } from "$tests/mocks/universe.mock";
import { Principal } from "@dfinity/principal";
import { ICPToken, TokenAmount, TokenAmountV2 } from "@dfinity/utils";

describe("token-utils", () => {
  it("should format token", () => {
    expect(formatTokenE8s({ value: 0n })).toEqual("0");
    expect(formatTokenE8s({ value: 10n })).toEqual("0.0000001");
    expect(formatTokenE8s({ value: 100n })).toEqual("0.000001");
    expect(formatTokenE8s({ value: 100_000_000n })).toEqual("1.00");
    expect(formatTokenE8s({ value: 1_000_000_000n })).toEqual("10.00");
    expect(formatTokenE8s({ value: 1_010_000_000n })).toEqual("10.10");
    expect(formatTokenE8s({ value: 1_012_300_000n })).toEqual("10.12");
    expect(formatTokenE8s({ value: 20_000_000_000n })).toEqual("200.00");
    expect(formatTokenE8s({ value: 20_000_000_001n })).toEqual("200.00");
    expect(formatTokenE8s({ value: 200_000_000_000n })).toEqual(`2'000.00`);
    expect(formatTokenE8s({ value: 200_000_000_000_000n })).toEqual(
      `2'000'000.00`
    );
  });

  it("should format token detailed", () => {
    expect(formatTokenE8s({ value: 0n, detailed: true })).toEqual("0");
    expect(formatTokenE8s({ value: 100n, detailed: true })).toEqual("0.000001");
    expect(formatTokenE8s({ value: 100_000_000n, detailed: true })).toEqual(
      "1.00"
    );
    expect(formatTokenE8s({ value: 1_000_000_000n, detailed: true })).toEqual(
      "10.00"
    );
    expect(formatTokenE8s({ value: 1_010_000_000n, detailed: true })).toEqual(
      "10.10"
    );
    expect(formatTokenE8s({ value: 1_012_300_000n, detailed: true })).toEqual(
      "10.123"
    );
    expect(formatTokenE8s({ value: 20_000_000_000n, detailed: true })).toEqual(
      "200.00"
    );
    expect(formatTokenE8s({ value: 20_000_000_001n, detailed: true })).toEqual(
      "200.00000001"
    );
    expect(formatTokenE8s({ value: 200_000_000_000n, detailed: true })).toEqual(
      `2'000.00`
    );
    expect(
      formatTokenE8s({ value: 200_000_000_000_000n, detailed: true })
    ).toEqual(`2'000'000.00`);
  });

  it("should format token detailed with height decimals", () => {
    expect(formatTokenE8s({ value: 0n, detailed: "height_decimals" })).toEqual(
      "0"
    );
    expect(formatTokenE8s({ value: 1n, detailed: "height_decimals" })).toEqual(
      "0.00000001"
    );
    expect(formatTokenE8s({ value: 10n, detailed: "height_decimals" })).toEqual(
      "0.00000010"
    );
    expect(
      formatTokenE8s({ value: 100n, detailed: "height_decimals" })
    ).toEqual("0.00000100");
    expect(
      formatTokenE8s({ value: 100_000_000n, detailed: "height_decimals" })
    ).toEqual("1.00000000");
    expect(
      formatTokenE8s({ value: 1_000_000_000n, detailed: "height_decimals" })
    ).toEqual("10.00000000");
    expect(
      formatTokenE8s({ value: 1_010_000_000n, detailed: "height_decimals" })
    ).toEqual("10.10000000");
    expect(
      formatTokenE8s({ value: 1_012_300_000n, detailed: "height_decimals" })
    ).toEqual("10.12300000");
    expect(
      formatTokenE8s({
        value: 20_000_000_000n,
        detailed: "height_decimals",
      })
    ).toEqual("200.00000000");
    expect(
      formatTokenE8s({
        value: 20_000_000_001n,
        detailed: "height_decimals",
      })
    ).toEqual("200.00000001");
    expect(
      formatTokenE8s({
        value: 200_000_000_000n,
        detailed: "height_decimals",
      })
    ).toEqual(`2'000.00000000`);
    expect(
      formatTokenE8s({
        value: 200_000_000_000_000n,
        detailed: "height_decimals",
      })
    ).toEqual(`2'000'000.00000000`);
  });

  it("should use roundingMode", () => {
    // NodeJS supports roundingMode since v19
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#browser_compatibility
    // expect(formatTokenE8s({ value: 111_100_000n, roundingMode: "ceil" })).toEqual(
    //   "1.12"
    // );
    expect(
      formatTokenE8s({ value: 111_100_000n, roundingMode: "ceil" })
    ).toEqual("1.11");
  });

  describe("formatTokenV2", () => {
    describe("with 8 decimals", () => {
      const token = {
        decimals: 8,
        symbol: "ICP",
        name: "Internet Computer",
      };

      const testFormat = ({
        value,
        detailed,
        roundingMode,
        extraDetailForSmallAmount,
      }: {
        value: bigint;
        detailed?: boolean | "height_decimals";
        roundingMode?: "ceil";
        extraDetailForSmallAmount?: boolean;
      }) => {
        const format1 = formatTokenE8s({
          value,
          detailed,
          roundingMode,
          extraDetailForSmallAmount,
        });
        const format2 = formatTokenV2({
          value: TokenAmountV2.fromUlps({ amount: value, token }),
          detailed,
          roundingMode,
          extraDetailForSmallAmount,
        });
        expect(format1).toBe(format2);
        return format2;
      };

      it("should format token", () => {
        expect(testFormat({ value: 0n })).toEqual("0");
        expect(testFormat({ value: 10n })).toEqual("0.0000001");
        expect(testFormat({ value: 100n })).toEqual("0.000001");
        expect(testFormat({ value: 100_000_000n })).toEqual("1.00");
        expect(testFormat({ value: 1_000_000_000n })).toEqual("10.00");
        expect(testFormat({ value: 1_010_000_000n })).toEqual("10.10");
        expect(testFormat({ value: 1_012_300_000n })).toEqual("10.12");
        expect(testFormat({ value: 20_000_000_000n })).toEqual("200.00");
        expect(testFormat({ value: 20_000_000_001n })).toEqual("200.00");
        expect(testFormat({ value: 200_000_000_000n })).toEqual(`2'000.00`);
        expect(testFormat({ value: 200_000_000_000_000n })).toEqual(
          `2'000'000.00`
        );
      });

      it("should format token detailed", () => {
        expect(testFormat({ value: 0n, detailed: true })).toEqual("0");
        expect(testFormat({ value: 100n, detailed: true })).toEqual("0.000001");
        expect(testFormat({ value: 100_000_000n, detailed: true })).toEqual(
          "1.00"
        );
        expect(testFormat({ value: 1_000_000_000n, detailed: true })).toEqual(
          "10.00"
        );
        expect(testFormat({ value: 1_010_000_000n, detailed: true })).toEqual(
          "10.10"
        );
        expect(testFormat({ value: 1_012_300_000n, detailed: true })).toEqual(
          "10.123"
        );
        expect(testFormat({ value: 20_000_000_000n, detailed: true })).toEqual(
          "200.00"
        );
        expect(testFormat({ value: 20_000_000_001n, detailed: true })).toEqual(
          "200.00000001"
        );
        expect(testFormat({ value: 200_000_000_000n, detailed: true })).toEqual(
          `2'000.00`
        );
        expect(
          testFormat({ value: 200_000_000_000_000n, detailed: true })
        ).toEqual(`2'000'000.00`);
      });

      it("should format token detailed with height decimals", () => {
        expect(testFormat({ value: 0n, detailed: "height_decimals" })).toEqual(
          "0"
        );
        expect(testFormat({ value: 1n, detailed: "height_decimals" })).toEqual(
          "0.00000001"
        );
        expect(testFormat({ value: 10n, detailed: "height_decimals" })).toEqual(
          "0.00000010"
        );
        expect(
          testFormat({ value: 100n, detailed: "height_decimals" })
        ).toEqual("0.00000100");
        expect(
          testFormat({ value: 100_000_000n, detailed: "height_decimals" })
        ).toEqual("1.00000000");
        expect(
          testFormat({ value: 1_000_000_000n, detailed: "height_decimals" })
        ).toEqual("10.00000000");
        expect(
          testFormat({ value: 1_010_000_000n, detailed: "height_decimals" })
        ).toEqual("10.10000000");
        expect(
          testFormat({ value: 1_012_300_000n, detailed: "height_decimals" })
        ).toEqual("10.12300000");
        expect(
          testFormat({ value: 20_000_000_000n, detailed: "height_decimals" })
        ).toEqual("200.00000000");
        expect(
          testFormat({ value: 20_000_000_001n, detailed: "height_decimals" })
        ).toEqual("200.00000001");
        expect(
          testFormat({ value: 200_000_000_000n, detailed: "height_decimals" })
        ).toEqual(`2'000.00000000`);
        expect(
          testFormat({
            value: 200_000_000_000_000n,
            detailed: "height_decimals",
          })
        ).toEqual(`2'000'000.00000000`);
      });

      it("should format token without extra detail", () => {
        expect(
          testFormat({ value: 0n, extraDetailForSmallAmount: false })
        ).toEqual("0");
        expect(
          testFormat({ value: 400_000n, extraDetailForSmallAmount: false })
        ).toEqual("0.00");
        expect(
          testFormat({ value: 600_000n, extraDetailForSmallAmount: false })
        ).toEqual("0.01");
        expect(
          testFormat({ value: 1_400_000n, extraDetailForSmallAmount: false })
        ).toEqual("0.01");
      });

      it("should use roundingMode", () => {
        // NodeJS supports roundingMode since v19
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#browser_compatibility
        // expect(testFormat({ value: 111_100_000n, roundingMode: "ceil" })).toEqual(
        //   "1.12"
        // );
        expect(
          testFormat({ value: 111_100_000n, roundingMode: "ceil" })
        ).toEqual("1.11");
      });
    });

    describe("with 6 decimals", () => {
      const token = {
        decimals: 6,
        symbol: "ckUSDC",
        name: "Chain key USDC",
      };

      const testFormat = (amount: string) => {
        expect(
          formatTokenV2({
            value: TokenAmountV2.fromString({ amount, token }) as TokenAmountV2,
          })
        ).toEqual(amount);
      };

      const testFormatDetailed = (amount: string) => {
        expect(
          formatTokenV2({
            value: TokenAmountV2.fromString({ amount, token }) as TokenAmountV2,
            detailed: true,
          })
        ).toEqual(amount);
      };

      const testFormatHeightDecimals = (amount: string) => {
        expect(
          formatTokenV2({
            value: TokenAmountV2.fromString({ amount, token }) as TokenAmountV2,
            detailed: "height_decimals",
          })
        ).toEqual(amount);
      };

      it("should format token", () => {
        testFormat("1.00");
        testFormat("1'000'000.00");
        testFormat("0.01");
        testFormat("0.001");
        testFormat("0.0001");
        testFormat("0.00001");
        testFormat("0.000001");
        testFormat("1.01");
        expect(
          formatTokenV2({
            value: TokenAmountV2.fromString({
              amount: "1.001",
              token,
            }) as TokenAmountV2,
          })
        ).toEqual("1.00");
      });

      it("should format detailed token", () => {
        testFormatDetailed("1.00");
        testFormatDetailed("1'000'000.00");
        testFormatDetailed("0.01");
        testFormatDetailed("0.001");
        testFormatDetailed("0.0001");
        testFormatDetailed("0.00001");
        testFormatDetailed("0.000001");
        testFormatDetailed("1.01");
        testFormatDetailed("1.001");
        testFormatDetailed("1.0001");
        testFormatDetailed("1.00001");
        testFormatDetailed("1.000001");
      });

      it("should format height decimals token", () => {
        testFormatHeightDecimals("1.000000");
        testFormatHeightDecimals("1'000'000.000000");
        testFormatHeightDecimals("0.010000");
        testFormatHeightDecimals("0.001000");
        testFormatHeightDecimals("0.000100");
        testFormatHeightDecimals("0.000010");
        testFormatHeightDecimals("0.000001");
        testFormatHeightDecimals("1.010000");
        testFormatHeightDecimals("1.001000");
        testFormatHeightDecimals("1.000100");
        testFormatHeightDecimals("1.000010");
        testFormatHeightDecimals("1.000001");
      });
    });

    describe("with 18 decimals", () => {
      const token = {
        decimals: 18,
        symbol: "ckETH",
        name: "ckETH",
      };

      const testFormat = (amount: string) => {
        expect(
          formatTokenV2({
            value: TokenAmountV2.fromString({ amount, token }) as TokenAmountV2,
          })
        ).toEqual(amount);
      };

      const testFormatDetailed = (amount: string) => {
        expect(
          formatTokenV2({
            value: TokenAmountV2.fromString({ amount, token }) as TokenAmountV2,
            detailed: true,
          })
        ).toEqual(amount);
      };

      const testFormatHeightDecimals = (amount: string) => {
        expect(
          formatTokenV2({
            value: TokenAmountV2.fromString({ amount, token }) as TokenAmountV2,
            detailed: "height_decimals",
          })
        ).toEqual(amount);
      };

      it("should format token", () => {
        testFormat("1.00");
        testFormat("1'000'000.00");
        testFormat("0.01");
        testFormat("0.001");
        testFormat("0.0001");
        testFormat("0.00001");
        testFormat("0.000001");
        testFormat("0.0000001");
        testFormat("0.00000001");
        testFormat("1.01");
        expect(
          formatTokenV2({
            value: TokenAmountV2.fromString({
              amount: "1.001",
              token,
            }) as TokenAmountV2,
          })
        ).toEqual("1.00");
      });

      it("should format detailed token", () => {
        testFormatDetailed("1.00");
        testFormatDetailed("1'000'000.00");
        testFormatDetailed("0.01");
        testFormatDetailed("0.001");
        testFormatDetailed("0.0001");
        testFormatDetailed("0.00001");
        testFormatDetailed("0.000001");
        testFormatDetailed("1.01");
        testFormatDetailed("1.001");
        testFormatDetailed("1.0001");
        testFormatDetailed("1.00001");
        testFormatDetailed("1.000001");
      });

      it("should format height decimals token", () => {
        testFormatHeightDecimals("1.00000000");
        testFormatHeightDecimals("1'000'000.00000000");
        testFormatHeightDecimals("0.01000000");
        testFormatHeightDecimals("0.00100000");
        testFormatHeightDecimals("0.00010000");
        testFormatHeightDecimals("0.00001000");
        testFormatHeightDecimals("0.00000100");
        testFormatHeightDecimals("0.00000010");
        testFormatHeightDecimals("0.00000001");
        testFormatHeightDecimals("1.01000000");
        testFormatHeightDecimals("1.00100000");
        testFormatHeightDecimals("1.00010000");
        testFormatHeightDecimals("1.00001000");
        testFormatHeightDecimals("1.00000100");
        testFormatHeightDecimals("1.00000010");
        testFormatHeightDecimals("1.00000001");
      });
    });
  });

  describe("toTokenAmountV2", () => {
    const token = {
      decimals: 8,
      symbol: "ICP",
      name: "Internet Computer",
    };

    it("should convert TokenAmount to TokenAmountV2", () => {
      const amount = 123_456n;
      expect(
        toTokenAmountV2(
          TokenAmount.fromE8s({
            amount,
            token,
          })
        )
      ).toEqual(
        TokenAmountV2.fromUlps({
          amount,
          token,
        })
      );
    });

    it("should return TokenAmountV2 as is", () => {
      const amount = 123_457n;
      const tokenAmountV2 = TokenAmountV2.fromUlps({
        amount,
        token,
      });
      expect(toTokenAmountV2(tokenAmountV2)).toBe(tokenAmountV2);
    });
  });

  describe("sumAmounts", () => {
    it("should sum amounts of E8s values", () => {
      const icp0 = 0n;
      const icp1 = 100_000_000n;
      const icp15 = 150_000_000n;
      const icp2 = 200_000_000n;
      const icp3 = 300_000_000n;
      const icp35 = 350_000_000n;
      const icp6 = 600_000_000n;

      expect(sumAmounts(icp0, icp1)).toEqual(icp1);
      expect(sumAmounts(icp1, icp2)).toEqual(icp3);
      expect(sumAmounts(icp1, icp2, icp3)).toEqual(icp6);
      expect(sumAmounts(icp15, icp2)).toEqual(icp35);
    });
  });

  it("should format a specific transaction fee", () =>
    expect(formattedTransactionFeeICP(DEFAULT_TRANSACTION_FEE_E8S)).toEqual(
      "0.0001"
    ));

  it("getMaxTransactionAmount should max taking into account fee, maxAmount and converte it to a number", () => {
    const fee = BigInt(DEFAULT_TRANSACTION_FEE_E8S);
    expect(getMaxTransactionAmount({ fee, token: ICPToken })).toEqual(0);
    expect(
      getMaxTransactionAmount({
        balance: 0n,
        fee,
        token: ICPToken,
      })
    ).toEqual(0);
    expect(
      getMaxTransactionAmount({
        balance: 10_000n,
        fee,
        token: ICPToken,
      })
    ).toEqual(0);
    expect(
      getMaxTransactionAmount({
        balance: 11_000n,
        fee,
        token: ICPToken,
      })
    ).toEqual(0.00001);
    expect(
      getMaxTransactionAmount({
        balance: 100_000_000n,
        fee,
        token: ICPToken,
      })
    ).toEqual(0.9999);
    expect(
      getMaxTransactionAmount({
        balance: 1_000_000_000n,
        maxAmount: 500_000_000n,
        token: ICPToken,
      })
    ).toEqual(5);
    expect(
      getMaxTransactionAmount({
        balance: 1_000_000_000n,
        fee,
        token: ICPToken,
        maxAmount: 500_000_000n,
      })
    ).toEqual(5);
    expect(
      getMaxTransactionAmount({
        balance: 100_000_000n,
        fee,
        token: ICPToken,
        maxAmount: 500_000_000n,
      })
    ).toEqual(0.9999);
    expect(
      getMaxTransactionAmount({
        balance: 0n,
        fee,
        token: ICPToken,
        maxAmount: 500_000_000n,
      })
    ).toEqual(0);
    expect(
      getMaxTransactionAmount({
        balance: 0n,
        fee,
        token: ICPToken,
      })
    ).toEqual(0);
  });

  it("getMaxTransactionAmount should truncate tokens with more than 8 decimals to 8 decimals", () => {
    expect(
      getMaxTransactionAmount({
        balance: 20_000_000_000_000_000_000n,
        fee: 2_000_000_000_000n,
        token: mockCkETHToken,
        maxAmount: 2_000_000_000_000_000_000n,
      })
    ).toEqual(2);
    expect(
      getMaxTransactionAmount({
        balance: 20_000_000_000_000_000_000n,
        fee: 2_000_000_000_000n,
        token: mockCkETHToken,
        maxAmount: 200_000_000_000_000_000_000n,
      })
    ).toEqual(19.999998);
  });

  describe("convertIcpToTCycles", () => {
    it("converts ICP to TCycles", () => {
      expect(convertIcpToTCycles({ icpNumber: 1, exchangeRate: 10_000n })).toBe(
        1
      );
      expect(
        convertIcpToTCycles({ icpNumber: 2.5, exchangeRate: 10_000n })
      ).toBe(2.5);
      expect(
        convertIcpToTCycles({ icpNumber: 2.5, exchangeRate: 20_000n })
      ).toBe(5);
      expect(convertIcpToTCycles({ icpNumber: 1, exchangeRate: 15_000n })).toBe(
        1.5
      );
    });
  });

  describe("convertTCyclesToIcpNumber", () => {
    it("converts TCycles to number", () => {
      expect(
        convertTCyclesToIcpNumber({ tCycles: 1, exchangeRate: 10_000n })
      ).toBe(1);
      expect(
        convertTCyclesToIcpNumber({
          tCycles: 2.5,
          exchangeRate: 10_000n,
        })
      ).toBe(2.5);
      expect(
        convertTCyclesToIcpNumber({
          tCycles: 2.5,
          exchangeRate: 20_000n,
        })
      ).toBe(1.25);
      expect(
        convertTCyclesToIcpNumber({ tCycles: 1, exchangeRate: 15_000n })
      ).toBe(2 / 3);
      expect(
        convertTCyclesToIcpNumber({
          tCycles: 4.32,
          exchangeRate: 10_000n,
        })
      ).toBe(4.32);
    });
  });

  describe("numberToE8s", () => {
    it("converts number to e8s", () => {
      expect(numberToE8s(1.14)).toBe(114_000_000n);
      expect(numberToE8s(1)).toBe(100_000_000n);
      expect(numberToE8s(3.14)).toBe(314_000_000n);
      expect(numberToE8s(0.14)).toBe(14_000_000n);
    });
  });

  describe("numberToUlps", () => {
    it("converts number to e8s", () => {
      const token = {
        decimals: 8,
        symbol: "TEST",
        name: "Test",
      };
      expect(numberToUlps({ amount: 1.14, token })).toBe(114_000_000n);
      expect(numberToUlps({ amount: 1, token })).toBe(100_000_000n);
      expect(numberToUlps({ amount: 3.14, token })).toBe(314_000_000n);
      expect(numberToUlps({ amount: 0.14, token })).toBe(14_000_000n);
      // TODO: Expect data after upgrading ic-js
      expect(numberToUlps({ amount: 0.00000002, token })).toBe(2n);
    });

    it("converts number to ulps with token", () => {
      const token = {
        decimals: 18,
        symbol: "TEST",
        name: "Test",
      };
      expect(numberToUlps({ amount: 1.14, token })).toBe(
        1_140_000_000_000_000_000n
      );
      expect(numberToUlps({ amount: 1, token })).toBe(
        1_000_000_000_000_000_000n
      );
      expect(numberToUlps({ amount: 3.14, token })).toBe(
        3_140_000_000_000_000_000n
      );
    });
  });

  describe("ulpsToNumber", () => {
    it("converts e8s to amount of tokens", () => {
      expect(
        ulpsToNumber({
          ulps: 114_000_000n,
          token: ICPToken,
        })
      ).toBe(1.14);
      expect(
        ulpsToNumber({
          ulps: 114_234_567n,
          token: ICPToken,
        })
      ).toBe(1.14234567);
      expect(
        ulpsToNumber({
          ulps: 0n,
          token: ICPToken,
        })
      ).toBe(0);
      expect(
        ulpsToNumber({
          ulps: 4_000_000n,
          token: ICPToken,
        })
      ).toBe(0.04);
      expect(
        ulpsToNumber({
          ulps: 1_000_000_000_000n,
          token: ICPToken,
        })
      ).toBe(10_000);
    });

    it("converts ulps with more than 8 decimals to token", () => {
      const token = {
        ...mockSnsToken,
        decimals: 18,
      };
      expect(
        ulpsToNumber({
          ulps: 1_140_000_000_000_000_000n,
          token,
        })
      ).toBe(1.14);
      expect(
        ulpsToNumber({
          ulps: 1_142_345_670_000_000_000n,
          token,
        })
      ).toBe(1.14234567);
      expect(
        ulpsToNumber({
          ulps: 0n,
          token,
        })
      ).toBe(0);
      expect(
        ulpsToNumber({
          ulps: 40_000_000_000_000_000n,
          token,
        })
      ).toBe(0.04);
      expect(
        ulpsToNumber({
          ulps: 10_000_000_000_000_000_000_000n,
          token,
        })
      ).toBe(10_000);
    });

    it("converts ulps with less than 8 decimals to token", () => {
      const token = {
        ...mockSnsToken,
        decimals: 4,
      };
      expect(
        ulpsToNumber({
          ulps: 11_400n,
          token,
        })
      ).toBe(1.14);
      expect(
        ulpsToNumber({
          ulps: 11_423n,
          token,
        })
      ).toBe(1.1423);
      expect(
        ulpsToNumber({
          ulps: 0n,
          token,
        })
      ).toBe(0);
      expect(
        ulpsToNumber({
          ulps: 400n,
          token,
        })
      ).toBe(0.04);
      expect(
        ulpsToNumber({
          ulps: 100_000_000n,
          token,
        })
      ).toBe(10_000);
    });

    it("truncates ulps with more than 8 decimals to 8 decimals", () => {
      const token = {
        ...mockSnsToken,
        decimals: 18,
      };
      expect(
        ulpsToNumber({
          ulps: 1_142_345_678_912_345_678n,
          token,
        })
      ).toBe(1.14234567);
    });

    it("doesn't convert with token of 0 decimals", () => {
      const token = {
        ...mockSnsToken,
        decimals: 0,
      };
      expect(
        ulpsToNumber({
          ulps: 1_142n,
          token,
        })
      ).toBe(1142);
    });
  });

  describe("sortUserTokens", () => {
    const icpHref = buildWalletUrl({
      universe: OWN_CANISTER_ID_TEXT,
    });
    const loadingUserToken: UserToken = {
      ...icpTokenBase,
      title: "Main",
      balance: "loading",
      actions: [],
      rowHref: icpHref,
      domKey: icpHref,
    };
    const userToken = (balanceUlps: bigint): UserToken => ({
      universeId: Principal.fromText(nnsUniverseMock.canisterId),
      ledgerCanisterId: LEDGER_CANISTER_ID,
      title: "a title",
      subtitle: undefined,
      balance: TokenAmountV2.fromUlps({
        amount: balanceUlps,
        token: NNS_TOKEN_DATA,
      }),
      logo: nnsUniverseMock.logo,
      token: NNS_TOKEN_DATA,
      fee: TokenAmountV2.fromUlps({
        amount: NNS_TOKEN_DATA.fee,
        token: NNS_TOKEN_DATA,
      }),
      rowHref: "row href",
      domKey: "row href",
      accountIdentifier: mockSubAccount.identifier,
      actions: [UserTokenAction.Receive, UserTokenAction.Send],
    });
    const token1 = userToken(1n);
    const token3 = userToken(3n);
    const token5 = userToken(5n);

    it("should sort tokens", () => {
      expect(sortUserTokens([token3, token1, token5])).toEqual([
        token5,
        token3,
        token1,
      ]);
    });

    it("should place use tokens w/o a balance at the end of the list", () => {
      expect(
        sortUserTokens([
          loadingUserToken,
          token3,
          token1,
          loadingUserToken,
          token5,
        ])
      ).toEqual([token5, token3, token1, loadingUserToken, loadingUserToken]);
    });
  });
});
