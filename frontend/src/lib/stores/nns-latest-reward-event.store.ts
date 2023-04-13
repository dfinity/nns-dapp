import type { RewardEvent } from "@dfinity/nns";
import { writable, type Readable } from "svelte/store";

export type NnsLatestRewardEventStoreData = RewardEvent | undefined;

interface NnsLatestRewardEventStore
  extends Readable<NnsLatestRewardEventStoreData> {
  setLatestRewardEvent: (rewardEvent: RewardEvent) => void;
  reset: () => void;
}

/**
 * A store that contains the latest reward event for NNS.
 *
 * - setLatestRewardEvent: replace the reward event in the store.
 * - reset: reset the store to its initial state.
 */
const initNnsLatestRewardEventStore = (): NnsLatestRewardEventStore => {
  const { subscribe, set } = writable<NnsLatestRewardEventStoreData>(undefined);

  return {
    subscribe,

    setLatestRewardEvent(rewardEvent: RewardEvent) {
      set(rewardEvent);
    },

    // For testing purposes.
    reset() {
      set(undefined);
    },
  };
};

export const nnsLatestRewardEventStore = initNnsLatestRewardEventStore();
