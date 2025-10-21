import { snsAggregatorDerived } from "$lib/derived/sns-aggregator.derived";
import { convertDtoRewardEvent } from "$lib/utils/sns-aggregator-converters.utils";
import { isNullish } from "@dfinity/utils";
import type { CanisterIdString } from "@icp-sdk/canisters/nns";
import type { SnsRewardEvent } from "@icp-sdk/canisters/sns";
import { type Readable } from "svelte/store";

export interface SnsLatestRewardEventStoreData {
  // Root canister id is the key to identify the latest reward events for a specific project.
  [rootCanisterId: CanisterIdString]: SnsRewardEvent | undefined;
}

/**
 * A store that contains the latest sns reward events for each project.
 */
export const snsLatestRewardEventStore: Readable<SnsLatestRewardEventStoreData> =
  snsAggregatorDerived((sns) =>
    isNullish(sns.latest_reward_event)
      ? undefined
      : convertDtoRewardEvent(sns.latest_reward_event)
  );
