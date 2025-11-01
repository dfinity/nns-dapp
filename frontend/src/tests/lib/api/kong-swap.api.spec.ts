import { queryKongSwapTickers } from "$lib/api/kong-swap.api";
import { KONG_SWAP_URL } from "$lib/constants/environment.constants";

describe("kong-swap.api", () => {
  describe("queryKongSwapTickers", () => {
    it("should fetch KongSwap tickers", async () => {
      const tickersResponse = [
        {
          ticker_id: "mxzaz-hqaaa-aaaar-qaada-cai_cngnf-vqaaa-aaaar-qag4q-cai",
          base_currency: "mxzaz-hqaaa-aaaar-qaada-cai",
          target_currency: "cngnf-vqaaa-aaaar-qag4q-cai",
          pool_id: "2",
          last_price: 111324.134685011,
        },
      ];

      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: async () => tickersResponse,
      } as Response);

      expect(await queryKongSwapTickers()).toEqual(tickersResponse);

      expect(global.fetch).toBeCalledWith(new URL(`${KONG_SWAP_URL}/api/coingecko/tickers`));
      expect(global.fetch).toBeCalledTimes(1);
    });

    it("should throw if fetch fails", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
      } as Response);

      await expect(queryKongSwapTickers()).rejects.toThrow(
        new Error("Failed to fetch ticker information from KongSwap")
      );
    });
  });
});


