import { DEFAULT_TRANSACTION_FEE_E8S } from "$lib/constants/icp.constants";
import {
  convertIcpToTCycles,
  convertTCyclesToIcpNumber,
  formattedTransactionFee,
  formattedTransactionFeeICP,
  formatToken,
  getMaxTransactionAmount,
  numberToE8s,
  sumTokenAmounts,
} from "$lib/utils/token.utils";
import { ICPToken, TokenAmount } from "@dfinity/nns";

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

  describe("sumTokenAmounts", () => {
    it("should add amounts of token", () => {
      const icp0 = 0n;
      const icp1 = 100000000n;
      const icp15 = 150000000n;
      const icp2 = 200000000n;
      const icp3 = 300000000n;
      const icp35 = 350000000n;
      const icp6 = 600000000n;

      expect(sumTokenAmounts(icp0, icp1)).toEqual(icp1);
      expect(sumTokenAmounts(icp1, icp2)).toEqual(icp3);
      expect(sumTokenAmounts(icp1, icp2, icp3)).toEqual(icp6);
      expect(sumTokenAmounts(icp15, icp2)).toEqual(icp35);
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
    expect(getMaxTransactionAmount({ fee })).toEqual(0);
    expect(
      getMaxTransactionAmount({
        balance: BigInt(0),
        fee,
      })
    ).toEqual(0);
    expect(
      getMaxTransactionAmount({
        balance: BigInt(10_000),
        fee,
      })
    ).toEqual(0);
    expect(
      getMaxTransactionAmount({
        balance: BigInt(11_000),
        fee,
      })
    ).toEqual(0.00001);
    expect(
      getMaxTransactionAmount({
        balance: BigInt(100_000_000),
        fee,
      })
    ).toEqual(0.9999);
    expect(
      getMaxTransactionAmount({
        balance: BigInt(1_000_000_000),
        maxAmount: BigInt(500_000_000),
      })
    ).toEqual(5);
    expect(
      getMaxTransactionAmount({
        balance: BigInt(1_000_000_000),
        fee,
        maxAmount: BigInt(500_000_000),
      })
    ).toEqual(5);
    expect(
      getMaxTransactionAmount({
        balance: BigInt(100_000_000),
        fee,
        maxAmount: BigInt(500_000_000),
      })
    ).toEqual(0.9999);
    expect(
      getMaxTransactionAmount({
        balance: BigInt(0),
        fee,
        maxAmount: BigInt(500_000_000),
      })
    ).toEqual(0);
    expect(
      getMaxTransactionAmount({
        balance: BigInt(0),
        fee,
      })
    ).toEqual(0);
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
});
