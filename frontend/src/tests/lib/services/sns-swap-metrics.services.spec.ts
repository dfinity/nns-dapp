import * as snsSwapMetrics from "$lib/api/sns-swap-metrics.api";
import { loadSnsSwapMetrics } from "$lib/services/sns-swap-metrics.services";
import { snsSwapMetricsStore } from "$lib/stores/sns-swap-metrics.store";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";

describe("sns-swap-metrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    snsSwapMetricsStore.reset();
  });

  describe("loadSnsSwapMetrics", () => {
    const rootCanisterId = mockPrincipal;
    const swapCanisterId = Principal.fromText("aaaaa-aa");
    const saleBuyerCount = 1_000_000;
    const rawMetricsText = `
# TYPE sale_buyer_count gauge
sale_buyer_count ${saleBuyerCount} 1677707139456
# HELP sale_cf_participants_count`;

    it("should call querySnsSwapMetrics api and load metrics in the store", async () => {
      const querySnsSwapMetricsSpy = vi
        .spyOn(snsSwapMetrics, "querySnsSwapMetrics")
        .mockResolvedValue(rawMetricsText);
      await loadSnsSwapMetrics({
        rootCanisterId,
        swapCanisterId,
        forceFetch: false,
      });

      expect(querySnsSwapMetricsSpy).toBeCalledTimes(1);
      expect(querySnsSwapMetricsSpy).toBeCalledWith({
        swapCanisterId,
      });
      expect(
        get(snsSwapMetricsStore)[rootCanisterId.toText()]?.saleBuyerCount
      ).toEqual(saleBuyerCount);
    });

    it("should skip querySnsSwapMetrics call when metrics available in store", async () => {
      snsSwapMetricsStore.setMetrics({
        rootCanisterId,
        metrics: { saleBuyerCount: 123 },
      });

      const querySnsSwapMetricsSpy = vi
        .spyOn(snsSwapMetrics, "querySnsSwapMetrics")
        .mockResolvedValue(rawMetricsText);
      await loadSnsSwapMetrics({
        rootCanisterId,
        swapCanisterId,
        forceFetch: false,
      });

      expect(querySnsSwapMetricsSpy).not.toBeCalled();
    });

    it("should respect forceFetch flag", async () => {
      snsSwapMetricsStore.setMetrics({
        rootCanisterId,
        metrics: { saleBuyerCount: 123 },
      });
      const querySnsSwapMetricsSpy = vi
        .spyOn(snsSwapMetrics, "querySnsSwapMetrics")
        .mockResolvedValue(rawMetricsText);

      expect(
        get(snsSwapMetricsStore)[rootCanisterId.toText()]?.saleBuyerCount
      ).not.toEqual(saleBuyerCount);

      await loadSnsSwapMetrics({
        rootCanisterId,
        swapCanisterId,
        forceFetch: true,
      });

      expect(querySnsSwapMetricsSpy).toBeCalledTimes(1);
      expect(
        get(snsSwapMetricsStore)[rootCanisterId.toText()]?.saleBuyerCount
      ).toEqual(saleBuyerCount);
    });
  });
});
