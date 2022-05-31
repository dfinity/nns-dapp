import { Principal } from "@dfinity/principal";
import {
  formatCyclesToTCycles,
  getCanisterInfoById,
} from "../../../lib/utils/canisters.utils";
import { mockCanisters } from "../../mocks/canisters.mock";

describe("canister-utils", () => {
  describe("getCanisterInfoById", () => {
    it("should return the canister info if present", () => {
      const store = {
        canisters: mockCanisters,
        certified: true,
      };
      const canister = getCanisterInfoById({
        canisterId: mockCanisters[0].canister_id,
        canistersStore: store,
      });
      expect(canister).toBe(mockCanisters[0]);
    });

    it("should return undefined if not present", () => {
      const store = {
        canisters: mockCanisters,
        certified: true,
      };
      const canister = getCanisterInfoById({
        canisterId: Principal.fromText("aaaaa-aa"),
        canistersStore: store,
      });
      expect(canister).toBeUndefined();
    });
    it("should return undefiend if no canisters in the store", () => {
      const store = {
        canisters: undefined,
        certified: true,
      };
      const canister = getCanisterInfoById({
        canisterId: mockCanisters[0].canister_id,
        canistersStore: store,
      });
      expect(canister).toBeUndefined();
    });
  });

  describe("formatCyclesToTCycles", () => {
    it("formats cycles into T Cycles with three decimals of accuracy", () => {
      expect(formatCyclesToTCycles(BigInt(1_000_000_000_000))).toBe("1.000");
      expect(formatCyclesToTCycles(BigInt(876_500_000_000))).toBe("0.877");
      expect(formatCyclesToTCycles(BigInt(876_400_000_000))).toBe("0.876");
      expect(formatCyclesToTCycles(BigInt(10_120_000_000_000))).toBe("10.120");
    });
  });
});
