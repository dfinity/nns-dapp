import type { SnsSwapMetricsStoreData } from "$lib/stores/sns-swap-metrics.store";
import type { Principal } from "@dfinity/principal";
import type { SnsSwapDerivedState } from "@dfinity/sns";
import { fromNullable, nonNullish } from "@dfinity/utils";

export const swapSaleBuyerCount = ({
  swapMetrics,
  rootCanisterId,
  derivedState: { direct_participant_count },
}: {
  swapMetrics: SnsSwapMetricsStoreData;
  rootCanisterId: Principal | undefined;
  derivedState: SnsSwapDerivedState;
}): number | undefined => {
  if (nonNullish(fromNullable(direct_participant_count))) {
    return Number(fromNullable(direct_participant_count));
  }
  return rootCanisterId === undefined
    ? undefined
    : swapMetrics?.[rootCanisterId.toText()]?.saleBuyerCount;
};

/**
 * Returns whether the derived state has a buyers count.
 *
 * It returns undefined if the derived state is undefined or null.
 *
 * If the field is not set, we want to trigger a call to the raw canister metrics.
 * Therefore, we don't want to return `false` while the derived state is not present.
 */
export const hasBuyersCount = (
  derived: SnsSwapDerivedState | undefined | null
): undefined | boolean => {
  if (derived === undefined || derived === null) {
    return undefined;
  }
  return nonNullish(fromNullable(derived.direct_participant_count));
};
