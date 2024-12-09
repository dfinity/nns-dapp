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

    it("should only load tickers once", async () => {
      vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([
        mockIcpSwapTicker,
      ]);

      expect(get(icpSwapTickersStore)).toBeUndefined();

      await loadIcpSwapTickers();
      await loadIcpSwapTickers();

      expect(icpSwapApi.queryIcpSwapTickers).toBeCalledTimes(1);
    });

    it("should set error state on store when there is an error", async () => {
      vi.spyOn(console, "error").mockReturnValue();

      const error = new Error("Failed to fetch tickers");
      vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockRejectedValueOnce(error);

      expect(get(icpSwapTickersStore)).toBeUndefined();

      await loadIcpSwapTickers();

      expect(get(icpSwapTickersStore)).toBe("error");
    });
  });
});
