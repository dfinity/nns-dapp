import { formatICP } from "../../../lib/utils/icp.utils";

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
});
