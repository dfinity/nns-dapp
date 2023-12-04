import { DEFAULT_TRANSACTION_FEE_E8S } from "$lib/constants/icp.constants";
import {
  convertIcpToTCycles,
  convertTCyclesToIcpNumber,
  formattedTransactionFee,
  formattedTransactionFeeICP,
  formatToken,
  formatTokenV2,
  getMaxTransactionAmount,
  numberToE8s,
  numberToUlps,
  sumAmountE8s,
  toTokenAmountV2,
} from "$lib/utils/token.utils";
import { mockCkETHToken } from "$tests/mocks/cketh-accounts.mock";
import { ICPToken, TokenAmount, TokenAmountV2 } from "@dfinity/utils";

describe("token-utils", () => {
  it("should format token", () => {
    expect(formatToken({ value: BigInt(0) })).toEqual("0");
    // TODO: this following test used to equals 0.0000001 but because of the new ICP conversion it now renders 0.00
    // expect(formatToken({value: BigInt(10)})).toEqual("0.0000001");
    expect(formatToken({ value: BigInt(100) })).toEqual("0.000001");
    expect(formatToken({ value: BigInt(100000000) })).toEqual("1.00");
    expect(formatToken({ value: BigInt(1000000000) })).toEqual("10.00");
    expect(formatToken({ value: BigInt(1010000000) })).toEqual("10.10");
    expect(formatToken({ value: BigInt(1012300000) })).toEqual("10.12");
    expect(formatToken({ value: BigInt(20000000000) })).toEqual("200.00");
    expect(formatToken({ value: BigInt(20000000001) })).toEqual("200.00");
    expect(formatToken({ value: BigInt(200000000000) })).toEqual(`2'000.00`);
    expect(formatToken({ value: BigInt(200000000000000) })).toEqual(
      `2'000'000.00`
    );
  });

  it("should format token detailed", () => {
    expect(formatToken({ value: BigInt(0), detailed: true })).toEqual("0");
    expect(formatToken({ value: BigInt(100), detailed: true })).toEqual(
      "0.000001"
    );
    expect(formatToken({ value: BigInt(100000000), detailed: true })).toEqual(
      "1.00"
    );
    expect(formatToken({ value: BigInt(1000000000), detailed: true })).toEqual(
      "10.00"
    );
    expect(formatToken({ value: BigInt(1010000000), detailed: true })).toEqual(
      "10.10"
    );
    expect(formatToken({ value: BigInt(1012300000), detailed: true })).toEqual(
      "10.123"
    );
    expect(formatToken({ value: BigInt(20000000000), detailed: true })).toEqual(
      "200.00"
    );
    expect(formatToken({ value: BigInt(20000000001), detailed: true })).toEqual(
      "200.00000001"
    );
    expect(
      formatToken({ value: BigInt(200000000000), detailed: true })
    ).toEqual(`2'000.00`);
    expect(
      formatToken({ value: BigInt(200000000000000), detailed: true })
    ).toEqual(`2'000'000.00`);
  });

  it("should format token detailed with height decimals", () => {
    expect(
      formatToken({ value: BigInt(0), detailed: "height_decimals" })
    ).toEqual("0");
    expect(
      formatToken({ value: BigInt(1), detailed: "height_decimals" })
    ).toEqual("0.00000001");
    expect(
      formatToken({ value: BigInt(10), detailed: "height_decimals" })
    ).toEqual("0.00000010");
    expect(
      formatToken({ value: BigInt(100), detailed: "height_decimals" })
    ).toEqual("0.00000100");
    expect(
      formatToken({ value: BigInt(100000000), detailed: "height_decimals" })
    ).toEqual("1.00000000");
    expect(
      formatToken({ value: BigInt(1000000000), detailed: "height_decimals" })
    ).toEqual("10.00000000");
    expect(
      formatToken({ value: BigInt(1010000000), detailed: "height_decimals" })
    ).toEqual("10.10000000");
    expect(
      formatToken({ value: BigInt(1012300000), detailed: "height_decimals" })
    ).toEqual("10.12300000");
    expect(
      formatToken({ value: BigInt(20000000000), detailed: "height_decimals" })
    ).toEqual("200.00000000");
    expect(
      formatToken({ value: BigInt(20000000001), detailed: "height_decimals" })
    ).toEqual("200.00000001");
    expect(
      formatToken({ value: BigInt(200000000000), detailed: "height_decimals" })
    ).toEqual(`2'000.00000000`);
    expect(
      formatToken({
        value: BigInt(200000000000000),
        detailed: "height_decimals",
      })
    ).toEqual(`2'000'000.00000000`);
  });

  it("should use roundingMode", () => {
    // NodeJS supports roundingMode since v19
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#browser_compatibility
    // expect(formatToken({ value: 111_100_000n, roundingMode: "ceil" })).toEqual(
    //   "1.12"
    // );
    expect(formatToken({ value: 111_100_000n, roundingMode: "ceil" })).toEqual(
      "1.11"
    );
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
      }: {
        value: bigint;
        detailed?: boolean | "height_decimals";
        roundingMode?: "ceil";
      }) => {
        const format1 = formatToken({
          value,
          detailed,
          roundingMode,
        });
        const format2 = formatTokenV2({
          value: TokenAmountV2.fromUlps({ amount: value, token }),
          detailed,
          roundingMode,
        });
        expect(format1).toBe(format2);
        return format2;
      };

      it("should format token", () => {
        expect(testFormat({ value: 0n })).toEqual("0");
        // TODO: this following test used to equals 0.0000001 but because of the new ICP conversion it now renders 0.00
        // expect(testFormat({value: BigInt(10)})).toEqual("0.0000001");
        expect(testFormat({ value: 100n })).toEqual("0.000001");
        expect(testFormat({ value: 100000000n })).toEqual("1.00");
        expect(testFormat({ value: 1000000000n })).toEqual("10.00");
        expect(testFormat({ value: 1010000000n })).toEqual("10.10");
        expect(testFormat({ value: 1012300000n })).toEqual("10.12");
        expect(testFormat({ value: 20000000000n })).toEqual("200.00");
        expect(testFormat({ value: 20000000001n })).toEqual("200.00");
        expect(testFormat({ value: 200000000000n })).toEqual(`2'000.00`);
        expect(testFormat({ value: 200000000000000n })).toEqual(`2'000'000.00`);
      });

      it("should format token detailed", () => {
        expect(testFormat({ value: 0n, detailed: true })).toEqual("0");
        expect(testFormat({ value: 100n, detailed: true })).toEqual("0.000001");
        expect(testFormat({ value: 100000000n, detailed: true })).toEqual(
          "1.00"
        );
        expect(testFormat({ value: 1000000000n, detailed: true })).toEqual(
          "10.00"
        );
        expect(testFormat({ value: 1010000000n, detailed: true })).toEqual(
          "10.10"
        );
        expect(testFormat({ value: 1012300000n, detailed: true })).toEqual(
          "10.123"
        );
        expect(testFormat({ value: 20000000000n, detailed: true })).toEqual(
          "200.00"
        );
        expect(testFormat({ value: 20000000001n, detailed: true })).toEqual(
          "200.00000001"
        );
        expect(testFormat({ value: 200000000000n, detailed: true })).toEqual(
          `2'000.00`
        );
        expect(testFormat({ value: 200000000000000n, detailed: true })).toEqual(
          `2'000'000.00`
        );
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
          testFormat({ value: 100000000n, detailed: "height_decimals" })
        ).toEqual("1.00000000");
        expect(
          testFormat({ value: 1000000000n, detailed: "height_decimals" })
        ).toEqual("10.00000000");
        expect(
          testFormat({ value: 1010000000n, detailed: "height_decimals" })
        ).toEqual("10.10000000");
        expect(
          testFormat({ value: 1012300000n, detailed: "height_decimals" })
        ).toEqual("10.12300000");
        expect(
          testFormat({ value: 20000000000n, detailed: "height_decimals" })
        ).toEqual("200.00000000");
        expect(
          testFormat({ value: 20000000001n, detailed: "height_decimals" })
        ).toEqual("200.00000001");
        expect(
          testFormat({ value: 200000000000n, detailed: "height_decimals" })
        ).toEqual(`2'000.00000000`);
        expect(
          testFormat({
            value: 200000000000000n,
            detailed: "height_decimals",
          })
        ).toEqual(`2'000'000.00000000`);
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
      const amount = 123456n;
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
      const amount = 123457n;
      const tokenAmountV2 = TokenAmountV2.fromUlps({
        amount,
        token,
      });
      expect(toTokenAmountV2(tokenAmountV2)).toBe(tokenAmountV2);
    });
  });

  describe("sumAmountE8s", () => {
    it("should sum amounts of E8s values", () => {
      const icp0 = 0n;
      const icp1 = 100000000n;
      const icp15 = 150000000n;
      const icp2 = 200000000n;
      const icp3 = 300000000n;
      const icp35 = 350000000n;
      const icp6 = 600000000n;

      expect(sumAmountE8s(icp0, icp1)).toEqual(icp1);
      expect(sumAmountE8s(icp1, icp2)).toEqual(icp3);
      expect(sumAmountE8s(icp1, icp2, icp3)).toEqual(icp6);
      expect(sumAmountE8s(icp15, icp2)).toEqual(icp35);
    });
  });

  it("should format a specific transaction fee", () =>
    expect(formattedTransactionFeeICP(DEFAULT_TRANSACTION_FEE_E8S)).toEqual(
      "0.0001"
    ));

  it("should format a specific transaction fee with given token", () =>
    expect(
      formattedTransactionFee(
        TokenAmount.fromE8s({
          amount: BigInt(DEFAULT_TRANSACTION_FEE_E8S),
          token: ICPToken,
        })
      )
    ).toEqual("0.0001"));

  it("getMaxTransactionAmount should max taking into account fee, maxAmount and converte it to a number", () => {
    const fee = BigInt(DEFAULT_TRANSACTION_FEE_E8S);
    expect(getMaxTransactionAmount({ fee, token: ICPToken })).toEqual(0);
    expect(
      getMaxTransactionAmount({
        balance: BigInt(0),
        fee,
        token: ICPToken,
      })
    ).toEqual(0);
    expect(
      getMaxTransactionAmount({
        balance: BigInt(10_000),
        fee,
        token: ICPToken,
      })
    ).toEqual(0);
    expect(
      getMaxTransactionAmount({
        balance: BigInt(11_000),
        fee,
        token: ICPToken,
      })
    ).toEqual(0.00001);
    expect(
      getMaxTransactionAmount({
        balance: BigInt(100_000_000),
        fee,
        token: ICPToken,
      })
    ).toEqual(0.9999);
    expect(
      getMaxTransactionAmount({
        balance: BigInt(1_000_000_000),
        maxAmount: BigInt(500_000_000),
        token: ICPToken,
      })
    ).toEqual(5);
    expect(
      getMaxTransactionAmount({
        balance: BigInt(1_000_000_000),
        fee,
        token: ICPToken,
        maxAmount: BigInt(500_000_000),
      })
    ).toEqual(5);
    expect(
      getMaxTransactionAmount({
        balance: BigInt(100_000_000),
        fee,
        token: ICPToken,
        maxAmount: BigInt(500_000_000),
      })
    ).toEqual(0.9999);
    expect(
      getMaxTransactionAmount({
        balance: BigInt(0),
        fee,
        token: ICPToken,
        maxAmount: BigInt(500_000_000),
      })
    ).toEqual(0);
    expect(
      getMaxTransactionAmount({
        balance: BigInt(0),
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
      expect(
        convertIcpToTCycles({ icpNumber: 1, exchangeRate: BigInt(10_000) })
      ).toBe(1);
      expect(
        convertIcpToTCycles({ icpNumber: 2.5, exchangeRate: BigInt(10_000) })
      ).toBe(2.5);
      expect(
        convertIcpToTCycles({ icpNumber: 2.5, exchangeRate: BigInt(20_000) })
      ).toBe(5);
      expect(
        convertIcpToTCycles({ icpNumber: 1, exchangeRate: BigInt(15_000) })
      ).toBe(1.5);
    });
  });

  describe("convertTCyclesToIcpNumber", () => {
    it("converts TCycles to number", () => {
      expect(
        convertTCyclesToIcpNumber({ tCycles: 1, exchangeRate: BigInt(10_000) })
      ).toBe(1);
      expect(
        convertTCyclesToIcpNumber({
          tCycles: 2.5,
          exchangeRate: BigInt(10_000),
        })
      ).toBe(2.5);
      expect(
        convertTCyclesToIcpNumber({
          tCycles: 2.5,
          exchangeRate: BigInt(20_000),
        })
      ).toBe(1.25);
      expect(
        convertTCyclesToIcpNumber({ tCycles: 1, exchangeRate: BigInt(15_000) })
      ).toBe(2 / 3);
      expect(
        convertTCyclesToIcpNumber({
          tCycles: 4.32,
          exchangeRate: BigInt(10_000),
        })
      ).toBe(4.32);
    });
  });

  describe("numberToE8s", () => {
    it("converts number to e8s", () => {
      expect(numberToE8s(1.14)).toBe(BigInt(114_000_000));
      expect(numberToE8s(1)).toBe(BigInt(100_000_000));
      expect(numberToE8s(3.14)).toBe(BigInt(314_000_000));
      expect(numberToE8s(0.14)).toBe(BigInt(14_000_000));
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
});
