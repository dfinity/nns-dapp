import * as icpSwapApi from "$lib/api/icp-swap.api";
import { loadIcpSwapTickers } from "$lib/services/icp-swap.services";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { get } from "svelte/store";

describe("icp-swap.services", () => {
  describe("loadIcpSwapTickers", () => {
    it("should load tickers into the store", async () => {
      vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([
        mockIcpSwapTicker,
      ]);

      expect(get(icpSwapTickersStore)).toBeUndefined();

      await loadIcpSwapTickers();

      expect(get(icpSwapTickersStore)).toEqual([mockIcpSwapTicker]);

      expect(icpSwapApi.queryIcpSwapTickers).toBeCalledTimes(1);
    });

    it("should not change the store when there is an error", async () => {
      vi.spyOn(console, "error").mockReturnValue();

      const error = new Error("Failed to fetch tickers");
      vi.spyOn(icpSwapApi, "queryIcpSwapTickers")
        .mockResolvedValueOnce([mockIcpSwapTicker])
        .mockRejectedValueOnce(error);

      expect(get(icpSwapTickersStore)).toBeUndefined();

      await loadIcpSwapTickers();

      const expectedStoreData = [mockIcpSwapTicker];

      expect(get(icpSwapTickersStore)).toEqual(expectedStoreData);
      expect(icpSwapApi.queryIcpSwapTickers).toBeCalledTimes(1);
      expect(console.error).toBeCalledTimes(0);

      await loadIcpSwapTickers();

      expect(get(icpSwapTickersStore)).toEqual(expectedStoreData);
      expect(icpSwapApi.queryIcpSwapTickers).toBeCalledTimes(2);
      expect(console.error).toBeCalledWith(error);
      expect(console.error).toBeCalledTimes(1);
    });
  });
});
