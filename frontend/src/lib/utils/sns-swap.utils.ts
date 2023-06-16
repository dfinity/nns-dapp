import type { SnsSwapMetricsStoreData } from "$lib/stores/sns-swap-metrics.store";
import type { Principal } from "@dfinity/principal";

export const swapSaleBuyerCount = ({
  swapMetrics,
  rootCanisterId,
}: {
  swapMetrics: SnsSwapMetricsStoreData;
  rootCanisterId: Principal | undefined;
}): number | undefined => {
  return rootCanisterId === undefined
    ? undefined
    : swapMetrics?.[rootCanisterId.toText()]?.saleBuyerCount;
};
