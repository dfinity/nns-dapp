import { ICP } from "@dfinity/nns";
import { formatICP, sumICPs } from "../../../lib/utils/icp.utils";

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
});
