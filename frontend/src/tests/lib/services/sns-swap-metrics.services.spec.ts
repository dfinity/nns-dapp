/**
 * @jest-environment jsdom
 */

import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";
import * as snsSwapMetrics from "../../../lib/api/sns-swap-metrics.api";
import { loadSnsSwapMetrics } from "../../../lib/services/sns-swap-metrics.services";
import { snsSwapMetricsStore } from "../../../lib/stores/sns-swap-metrics.store";
import { mockPrincipal } from "../../mocks/auth.store.mock";

describe("sns-swap-metrics", () => {
  const RAW_METRICS = `
# TYPE sale_buyer_count gauge
sale_buyer_count 33 1677707139456
# HELP sale_cf_participants_count`;

  beforeEach(() => {
    jest.clearAllMocks();
    snsSwapMetricsStore.reset();
  });

  describe("loadSnsSwapMetrics", () => {
    const rootCanisterId = mockPrincipal;
    const swapCanisterId = Principal.fromText("aaaaa-aa");

    it("should call querySnsSwapMetrics api and load metrics in the store", async () => {
      const querySnsSwapMetricsSpy = jest
        .spyOn(snsSwapMetrics, "querySnsSwapMetrics")
        .mockResolvedValue(RAW_METRICS);
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
      ).toEqual(33);
    });

    it("should skip querySnsSwapMetrics call when metrics available in store", async () => {
      snsSwapMetricsStore.setMetrics({
        rootCanisterId,
        metrics: { saleBuyerCount: 123 },
      });

      const querySnsSwapMetricsSpy = jest
        .spyOn(snsSwapMetrics, "querySnsSwapMetrics")
        .mockResolvedValue(RAW_METRICS);
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
      const querySnsSwapMetricsSpy = jest
        .spyOn(snsSwapMetrics, "querySnsSwapMetrics")
        .mockResolvedValue(RAW_METRICS);
      await loadSnsSwapMetrics({
        rootCanisterId,
        swapCanisterId,
        forceFetch: true,
      });

      expect(querySnsSwapMetricsSpy).toBeCalledTimes(1);
      expect(
        get(snsSwapMetricsStore)[rootCanisterId.toText()]?.saleBuyerCount
      ).toEqual(33);
    });
  });
});
