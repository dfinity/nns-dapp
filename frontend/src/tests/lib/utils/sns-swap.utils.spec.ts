import { swapSaleBuyerCount } from "$lib/utils/sns-swap.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { Principal } from "@dfinity/principal";

describe("sns-swap utils", () => {
  describe("swapSaleBuyerCount", () => {
    it("should return undefined if rootCanisterId or metrics are not defined", () => {
      expect(
        swapSaleBuyerCount({
          rootCanisterId: undefined,
          swapMetrics: undefined,
        })
      ).toBeUndefined();
      expect(
        swapSaleBuyerCount({ rootCanisterId: undefined, swapMetrics: null })
      ).toBeUndefined();
      expect(
        swapSaleBuyerCount({
          rootCanisterId: mockPrincipal,
          swapMetrics: undefined,
        })
      ).toBeUndefined();
      expect(
        swapSaleBuyerCount({ rootCanisterId: mockPrincipal, swapMetrics: null })
      ).toBeUndefined();
      expect(
        swapSaleBuyerCount({
          rootCanisterId: undefined,
          swapMetrics: { ["aaaaa-aa"]: { saleBuyerCount: 10 } },
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
        })
      ).toBe(saleCount);
    });
  });
});
