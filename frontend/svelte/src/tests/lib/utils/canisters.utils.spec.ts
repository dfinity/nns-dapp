import { Principal } from "@dfinity/principal";
import { getCanisterInfoById } from "../../../lib/utils/canisters.utils";
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
});
