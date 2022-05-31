import { ICP } from "@dfinity/nns";
import { E8S_PER_ICP } from "../../../lib/constants/icp.constants";
import { InvalidAmountError } from "../../../lib/types/neurons.errors";
import {
  convertIcpToTCycles,
  convertNumberToICP,
  convertTCyclesToE8s,
  formatICP,
  formattedTransactionFeeICP,
  maxICP,
  sumICPs,
} from "../../../lib/utils/icp.utils";

describe("icp-utils", () => {
  it("should format icp", () => {
    expect(formatICP(BigInt(0))).toEqual("0.00000000");
    expect(formatICP(BigInt(10))).toEqual("0.00000010");
    expect(formatICP(BigInt(100))).toEqual("0.00000100");
    expect(formatICP(BigInt(100000000))).toEqual("1.00000000");
    expect(formatICP(BigInt(1000000000))).toEqual("10.00000000");
    expect(formatICP(BigInt(1010000000))).toEqual("10.10000000");
    expect(formatICP(BigInt(1012300000))).toEqual("10.12300000");
    expect(formatICP(BigInt(20000000000))).toEqual("200.00000000");
    expect(formatICP(BigInt(20000000001))).toEqual("200.00000001");
    expect(formatICP(BigInt(200000000000))).toEqual(`2${"\u202F"}000.00000000`);
    expect(formatICP(BigInt(200000000000000))).toEqual(
      `2${"\u202F"}000${"\u202F"}000.00000000`
    );
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
    expect(formattedTransactionFeeICP()).toEqual("0.0001"));

  it("should max ICP value", () => {
    expect(maxICP(undefined)).toEqual(0);
    expect(maxICP(ICP.fromString("0") as ICP)).toEqual(0);
    expect(maxICP(ICP.fromString("0.0001") as ICP)).toEqual(0);
    expect(maxICP(ICP.fromString("0.00011") as ICP)).toEqual(0.00001);
    expect(maxICP(ICP.fromString("1") as ICP)).toEqual(0.9999);
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
      expect(convertIcpToTCycles({ icpNumber: 1, ratio: BigInt(10_000) })).toBe(
        1
      );
      expect(
        convertIcpToTCycles({ icpNumber: 2.5, ratio: BigInt(10_000) })
      ).toBe(2.5);
      expect(
        convertIcpToTCycles({ icpNumber: 2.5, ratio: BigInt(20_000) })
      ).toBe(5);
      expect(convertIcpToTCycles({ icpNumber: 1, ratio: BigInt(15_000) })).toBe(
        1.5
      );
    });
  });

  describe("convertTCyclesToE8s", () => {
    it("converts TCycles to E8s", () => {
      expect(convertTCyclesToE8s({ tCycles: 1, ratio: BigInt(10_000) })).toBe(
        BigInt(E8S_PER_ICP)
      );
      expect(convertTCyclesToE8s({ tCycles: 2.5, ratio: BigInt(10_000) })).toBe(
        BigInt(E8S_PER_ICP * 2.5)
      );
      expect(convertTCyclesToE8s({ tCycles: 2.5, ratio: BigInt(20_000) })).toBe(
        BigInt(125_000_000)
      );
      expect(convertTCyclesToE8s({ tCycles: 1, ratio: BigInt(15_000) })).toBe(
        BigInt(66666666)
      );
    });
  });
});
