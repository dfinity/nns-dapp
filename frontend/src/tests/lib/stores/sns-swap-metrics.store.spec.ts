import { snsSwapMetricsStore } from "$lib/stores/sns-swap-metrics.store";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { get } from "svelte/store";

describe("snsSwapMetricsStore", () => {
  const metrics = {
    saleBuyerCount: 123,
  };

  beforeEach(() => snsSwapMetricsStore.reset());

  it("should set metrics", () => {
    snsSwapMetricsStore.setMetrics({
      rootCanisterId: mockPrincipal,
      metrics,
    });

    const $snsSwapMetricsStore = get(snsSwapMetricsStore);
    expect($snsSwapMetricsStore[mockPrincipal.toText()]).toEqual(metrics);
  });
});
