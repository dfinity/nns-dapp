import { queryIcpSwapTickers } from "$lib/api/icp-swap.api";
import { ICP_SWAP_URL } from "$lib/constants/environment.constants";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";

describe("icp-swap.api", () => {
  describe("queryIcpSwapTickers", () => {
    it("should fetch ICP swap tickers", async () => {
      const tickersResponse = [mockIcpSwapTicker];

      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: async () => tickersResponse,
      } as Response);

      expect(await queryIcpSwapTickers()).toEqual(tickersResponse);

      expect(global.fetch).toBeCalledWith(new URL(`${ICP_SWAP_URL}/tickers`));
      expect(global.fetch).toBeCalledTimes(1);
    });

    it("should throw if fetch fails", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
      } as Response);

      expect(queryIcpSwapTickers()).rejects.toThrow(
        new Error("Failed to fetch ticker information from ICP Swap")
      );
    });
  });
});
