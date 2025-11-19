import type { CanisterIdString } from "@icp-sdk/canisters/nns";
import { writable, type Readable } from "svelte/store";

export type OutOfCyclesCanistersStoreData = CanisterIdString[];

export interface OutOfCyclesCanistersStore
  extends Readable<OutOfCyclesCanistersStoreData> {
  add: (canisterId: CanisterIdString) => void;
  delete: (canisterId: CanisterIdString) => void;
}

export const initOutOfCyclesCanistersStore = (): OutOfCyclesCanistersStore => {
  const initialOutOfCyclesCanisters: OutOfCyclesCanistersStoreData = [];

  const { subscribe, update } = writable<OutOfCyclesCanistersStoreData>(
    initialOutOfCyclesCanisters
  );

  return {
    subscribe,
    add: (canisterId) => {
      update((outOfCyclesCanisters: OutOfCyclesCanistersStoreData) =>
        outOfCyclesCanisters.includes(canisterId)
          ? outOfCyclesCanisters
          : [...outOfCyclesCanisters, canisterId]
      );
    },
    delete: (canisterId) => {
      update((canistersids) => canistersids.filter((id) => id !== canisterId));
    },
  };
};

export const outOfCyclesCanistersStore = initOutOfCyclesCanistersStore();
