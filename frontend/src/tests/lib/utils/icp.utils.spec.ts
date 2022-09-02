import { ICP } from "@dfinity/nns";
import { DEFAULT_TRANSACTION_FEE_E8S } from "../../../lib/constants/icp.constants";
import { InvalidAmountError } from "../../../lib/types/neurons.errors";
import {
  convertIcpToTCycles,
  convertNumberToICP,
  convertTCyclesToIcpNumber,
  formatICP,
  formattedTransactionFeeICP,
  getMaxTransactionAmount,
  sumICPs,
} from "../../../lib/utils/icp.utils";

describe("icp-utils", () => {
  it("should format icp", () => {
    expect(formatICP({ value: BigInt(0) })).toEqual("0");
    // TODO: this following test used to equals 0.0000001 but because of the new ICP conversion it now renders 0.00
    // expect(formatICP({value: BigInt(10)})).toEqual("0.0000001");
    expect(formatICP({ value: BigInt(100) })).toEqual("0.000001");
    expect(formatICP({ value: BigInt(100000000) })).toEqual("1.00");
    expect(formatICP({ value: BigInt(1000000000) })).toEqual("10.00");
    expect(formatICP({ value: BigInt(1010000000) })).toEqual("10.10");
    expect(formatICP({ value: BigInt(1012300000) })).toEqual("10.12");
    expect(formatICP({ value: BigInt(20000000000) })).toEqual("200.00");
    expect(formatICP({ value: BigInt(20000000001) })).toEqual("200.00");
    expect(formatICP({ value: BigInt(200000000000) })).toEqual(`2'000.00`);
    expect(formatICP({ value: BigInt(200000000000000) })).toEqual(
      `2'000'000.00`
    );
  });

  it("should format icp detailed", () => {
    expect(formatICP({ value: BigInt(0), detailed: true })).toEqual("0");
    expect(formatICP({ value: BigInt(100), detailed: true })).toEqual(
      "0.000001"
    );
    expect(formatICP({ value: BigInt(100000000), detailed: true })).toEqual(
      "1.00"
    );
    expect(formatICP({ value: BigInt(1000000000), detailed: true })).toEqual(
      "10.00"
    );
    expect(formatICP({ value: BigInt(1010000000), detailed: true })).toEqual(
      "10.10"
    );
    expect(formatICP({ value: BigInt(1012300000), detailed: true })).toEqual(
      "10.123"
    );
    expect(formatICP({ value: BigInt(20000000000), detailed: true })).toEqual(
      "200.00"
    );
    expect(formatICP({ value: BigInt(20000000001), detailed: true })).toEqual(
      "200.00000001"
    );
    expect(formatICP({ value: BigInt(200000000000), detailed: true })).toEqual(
      `2'000.00`
    );
    expect(
      formatICP({ value: BigInt(200000000000000), detailed: true })
    ).toEqual(`2'000'000.00`);
  });

  it("should add ICPs", () => {
    const icp0 = ICP.fromString("0") as ICP;
    const icp1 = ICP.fromString("1") as ICP;
    const icp15 = ICP.fromString("1.5") as ICP;
    const icp2 = ICP.fromString("2") as ICP;
    const icp3 = ICP.fromString("3") as ICP;
    const icp35 = ICP.fromString("3.5") as ICP;
    const icp6 = ICP.fromString("6") as ICP;

    expect(sumICPs(icp0, icp1)).toEqual(icp1);
    expect(sumICPs(icp1, icp2)).toEqual(icp3);
    expect(sumICPs(icp1, icp2, icp3)).toEqual(icp6);
    expect(sumICPs(icp15, icp2)).toEqual(icp35);
  });

  it("should format a specific transaction fee", () =>
    expect(formattedTransactionFeeICP(DEFAULT_TRANSACTION_FEE_E8S)).toEqual(
      "0.0001"
    ));

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
  });

  describe("convertNumberToICP", () => {
    it("returns ICP from number", () => {
      expect(convertNumberToICP(10)?.toE8s()).toBe(BigInt(1_000_000_000));
      expect(convertNumberToICP(10.1234)?.toE8s()).toBe(BigInt(1_012_340_000));
      expect(convertNumberToICP(0.004)?.toE8s()).toBe(BigInt(400_000));
      expect(convertNumberToICP(0.00000001)?.toE8s()).toBe(BigInt(1));
    });

    it("raises error on negative numbers", () => {
      const call = () => convertNumberToICP(-10);
      expect(call).toThrow(InvalidAmountError);
    });
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
});
