import { hasBuyersCount, swapSaleBuyerCount } from "$lib/utils/sns-swap.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockDerived } from "$tests/mocks/sns-projects.mock";
import { Principal } from "@dfinity/principal";
import type { SnsSwapDerivedState } from "@dfinity/sns";

describe("sns-swap utils", () => {
  describe("swapSaleBuyerCount", () => {
    describe("derived state does NOT have buyers count", () => {
      const derivedState: SnsSwapDerivedState = {
        ...mockDerived,
        direct_participant_count: [],
      };
      it("should return undefined if rootCanisterId or metrics are not defined", () => {
        expect(
          swapSaleBuyerCount({
            rootCanisterId: undefined,
            swapMetrics: undefined,
            derivedState,
          })
        ).toBeUndefined();
        expect(
          swapSaleBuyerCount({
            rootCanisterId: undefined,
            swapMetrics: null,
            derivedState,
          })
        ).toBeUndefined();
        expect(
          swapSaleBuyerCount({
            rootCanisterId: mockPrincipal,
            swapMetrics: undefined,
            derivedState,
          })
        ).toBeUndefined();
        expect(
          swapSaleBuyerCount({
            rootCanisterId: mockPrincipal,
            swapMetrics: null,
            derivedState,
          })
        ).toBeUndefined();
        expect(
          swapSaleBuyerCount({
            rootCanisterId: undefined,
            swapMetrics: { ["aaaaa-aa"]: { saleBuyerCount: 10 } },
            derivedState,
          })
        ).toBeUndefined();
      });

      it("should return undefined if root canister id is not in the metrics store", () => {
        expect(
          swapSaleBuyerCount({
            rootCanisterId: Principal.fromText(
              "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe"
            ),
            swapMetrics: { ["aaaaa-aa"]: { saleBuyerCount: 10 } },
            derivedState,
          })
        ).toBeUndefined();
      });

      it("should return sale count of the selected root canister id", () => {
        const saleCount = 100;
        expect(
          swapSaleBuyerCount({
            rootCanisterId: mockPrincipal,
            swapMetrics: {
              [mockPrincipal.toText()]: { saleBuyerCount: saleCount },
            },
            derivedState,
          })
        ).toBe(saleCount);
      });
    });

    describe("derived state has buyers count", () => {
      const participantsCount = 100;
      const derivedState: SnsSwapDerivedState = {
        ...mockDerived,
        direct_participant_count: [BigInt(participantsCount)],
      };
      it("should return sale count of the derived store ignoring the swap metrics data", () => {
        expect(
          swapSaleBuyerCount({
            rootCanisterId: mockPrincipal,
            swapMetrics: {
              [mockPrincipal.toText()]: { saleBuyerCount: 400 },
            },
            derivedState,
          })
        ).toBe(participantsCount);
      });
    });
  });

  describe("hasBuyersCount", () => {
    const derivedWithBuyersCount: SnsSwapDerivedState = {
      ...mockDerived,
      direct_participant_count: [100n],
    };
    const derivedWithoutBuyersCount: SnsSwapDerivedState = {
      ...mockDerived,
      direct_participant_count: [],
    };
    it("should return undefined if derived state is undefined or null", () => {
      expect(hasBuyersCount(undefined)).toBeUndefined();
      expect(hasBuyersCount(null)).toBeUndefined();
    });

    it("should return true if derived state has buyers count", () => {
      expect(hasBuyersCount(derivedWithBuyersCount)).toBe(true);
    });

    it("should return false if derived state has no buyers count", () => {
      expect(hasBuyersCount(derivedWithoutBuyersCount)).toBe(false);
    });
  });
});
