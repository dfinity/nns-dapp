import { formatCyclesToTCycles } from "../../../lib/utils/canisters.utils";

describe("canister-utils", () => {
  describe("formatCyclesToTCycles", () => {
    it("formats cycles into T Cycles with three decimals of accuracy", () => {
      expect(formatCyclesToTCycles(BigInt(1_000_000_000_000))).toBe("1.000");
      expect(formatCyclesToTCycles(BigInt(876_500_000_000))).toBe("0.877");
      expect(formatCyclesToTCycles(BigInt(876_400_000_000))).toBe("0.876");
      expect(formatCyclesToTCycles(BigInt(10_120_000_000_000))).toBe("10.120");
    });
  });
});
