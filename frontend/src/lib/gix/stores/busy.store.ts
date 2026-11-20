import type { BusyState } from "$lib/gix/types/busy";
import { nonNullish } from "@dfinity/utils";
import { derived, writable, type Readable } from "svelte/store";

export type BusyStoreData = Array<BusyState>;

export interface BusyStore extends Readable<BusyStoreData> {
  startBusy: (params: BusyState) => void;
  stopBusy: (initiatorToRemove: BusyState["initiator"]) => void;
  // For test purpose
  resetForTesting: () => void;
}

/**
 * Store that reflects the app busy state.
 * Is used to show the busy-screen that locks the UI.
 */
const initBusyStore = (): BusyStore => {
  const DEFAULT_STATE: BusyStoreData = [];

  const { subscribe, update, set } = writable<BusyStoreData>(DEFAULT_STATE);

  return {
    subscribe,
    /**
     * Show the busy-screen if not visible
     */
    startBusy: ({ initiator: newInitiator, text }: BusyState) => {
      update((state) => [
        ...state.filter(({ initiator }) => newInitiator !== initiator),
        { initiator: newInitiator, text },
      ]);
    },

    /**
     * Hide the busy-screen if no other initiators are done
     */
    stopBusy: (initiatorToRemove: BusyState["initiator"]) => {
      update((state) =>
        state.filter(({ initiator }) => initiator !== initiatorToRemove)
      );
    },

    resetForTesting: () => {
      set(DEFAULT_STATE);
    },
  };
};

export const busyStore = initBusyStore();

export const { startBusy, stopBusy } = busyStore;

export const busy: Readable<boolean> = derived(
  busyStore,
  ($busyStore) => $busyStore.length > 0
);

// Returns the newest message that was added to the store
export const busyMessage: Readable<string | undefined> = derived(
  busyStore,
  ($busyStore) => $busyStore.findLast(({ text }) => nonNullish(text))?.text
);
