import { swapSaleBuyerCount } from "$lib/utils/sns-swap.utils";
import { mockDerived } from "$tests/mocks/sns-projects.mock";
import type { SnsSwapDid } from "@icp-sdk/canisters/sns";

describe("sns-swap utils", () => {
  describe("swapSaleBuyerCount", () => {
    it("should return undefined when the derived state has no participant count", () => {
      const derivedState: SnsSwapDid.DerivedState = {
        ...mockDerived,
        direct_participant_count: [],
      };

      expect(swapSaleBuyerCount({ derivedState })).toBeUndefined();
    });

    it("should return the participant count of the derived state", () => {
      const derivedState: SnsSwapDid.DerivedState = {
        ...mockDerived,
        direct_participant_count: [30n],
      };

      expect(swapSaleBuyerCount({ derivedState })).toBe(30);
    });

    it("should return zero when the derived state reports no participant", () => {
      const derivedState: SnsSwapDid.DerivedState = {
        ...mockDerived,
        direct_participant_count: [0n],
      };

      expect(swapSaleBuyerCount({ derivedState })).toBe(0);
    });
  });
});
