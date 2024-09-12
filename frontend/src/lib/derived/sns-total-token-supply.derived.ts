import { snsAggregatorStore } from "$lib/stores/sns-aggregator.store";
import type { RootCanisterIdText } from "$lib/types/sns";
import { derived, type Readable } from "svelte/store";

interface ProjectTotalSupplyData {
  totalSupply: bigint;
}

export type SnsTotalTokenSupplyStoreData = Record<
  RootCanisterIdText,
  ProjectTotalSupplyData
>;

export interface SnsTotalTokenSupplyStore
  extends Readable<SnsTotalTokenSupplyStoreData> {}

/**
 * A store that contains the total token supply of SNS projects.
 */
export const snsTotalTokenSupplyStore: SnsTotalTokenSupplyStore = derived(
  snsAggregatorStore,
  (aggregatorStore) =>
    Object.fromEntries(
      aggregatorStore.data?.map((sns) => [
        sns.canister_ids.root_canister_id,
        {
          totalSupply: BigInt(sns.icrc1_total_supply),
        },
      ]) ?? []
    )
);
