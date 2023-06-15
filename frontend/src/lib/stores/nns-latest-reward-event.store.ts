import type { RewardEvent } from "@dfinity/nns";
import { isNullish } from "@dfinity/utils";
import { writable, type Readable } from "svelte/store";

type RewardEventData = {
  rewardEvent: RewardEvent;
  certified: boolean;
};

export type NnsLatestRewardEventStoreData = RewardEventData | undefined;

interface NnsLatestRewardEventStore
  extends Readable<NnsLatestRewardEventStoreData | undefined> {
  setLatestRewardEvent: (data: RewardEventData) => void;
  reset: () => void;
}

/**
 * A store that contains the latest reward event for NNS.
 *
 * - setLatestRewardEvent: replace the reward event in the store.
 * - reset: reset the store to its initial state.
 */
const initNnsLatestRewardEventStore = (): NnsLatestRewardEventStore => {
  const { subscribe, set, update } =
    writable<NnsLatestRewardEventStoreData>(undefined);

  return {
    subscribe,

    setLatestRewardEvent({ rewardEvent, certified }: RewardEventData) {
      update((currentData) => {
        if (isNullish(currentData)) {
          return { rewardEvent, certified };
        }
        const prevRewardEvent = currentData.rewardEvent;
        // Keep current data if the reward event parameter has a timestamp older than the current one and the current is certified.
        if (
          prevRewardEvent.actual_timestamp_seconds >=
            rewardEvent.actual_timestamp_seconds &&
          (currentData.certified || !certified)
        ) {
          return currentData;
        }
        return { rewardEvent, certified };
      });
    },

    // For testing purposes.
    reset() {
      set(undefined);
    },
  };
};

export const nnsLatestRewardEventStore = initNnsLatestRewardEventStore();
