import type { Readable } from "svelte/store";
import { derived, writable } from "svelte/store";

export type BusyStateInitiatorType =
  | "stake-neuron"
  | "update-delay"
  | "vote"
  | "accounts"
  | "join-community-fund"
  | "split-neuron"
  | "dissolve-action"
  | "add-followee"
  | "remove-followee"
  | "add-hotkey-neuron"
  | "remove-hotkey-neuron"
  | "reload-neurons"
  | "reload-proposal"
  | "merge-neurons"
  | "merge-maturity"
  | "spawn-neuron"
  | "disburse-neuron"
  | "remove-followee";

type BusyItem = {
  initiator: BusyStateInitiatorType;
  message?: string;
};

/**
 * Store that reflects the app busy state.
 * Is used to show the busy-screen that locks the UI
 */
const initBusyStore = () => {
  const { subscribe, update } = writable<Array<BusyItem>>([]);

  return {
    subscribe,

    /**
     * Show the busy-screen if not visible
     */
    startBusy(initiator: BusyStateInitiatorType, message?: string) {
      update((state) => [...state, { initiator, message }]);
    },

    /**
     * Hide the busy-screen if no other initiators are done
     */
    stopBusy(initiatorToRemove: BusyStateInitiatorType) {
      update((state) =>
        state.filter(({ initiator }) => initiator !== initiatorToRemove)
      );
    },
  };
};

const busyStore = initBusyStore();

export const { startBusy, stopBusy } = busyStore;

export const busy: Readable<boolean> = derived(
  busyStore,
  ($busyStore) => $busyStore.length > 0
);

export const firstBusyItem: Readable<BusyItem> = derived(
  busyStore,
  ($busyStore) => $busyStore[0]
);
