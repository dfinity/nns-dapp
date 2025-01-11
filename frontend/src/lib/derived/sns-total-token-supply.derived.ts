import { snsAggregatorDerived } from "$lib/derived/sns-aggregator.derived";
import type { RootCanisterIdText } from "$lib/types/sns";
import { type Readable } from "svelte/store";

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
export const snsTotalTokenSupplyStore: SnsTotalTokenSupplyStore =
  snsAggregatorDerived((sns) => ({
    totalSupply: BigInt(sns.icrc1_total_supply),
  }));
