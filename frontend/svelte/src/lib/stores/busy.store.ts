import { writable } from "svelte/store";

export type BusyStateInitiator = "vote" | "test" | "join-community-fund";

/**
 * Store that reflects the app busy state.
 * Is used to show the busy-screen that locks the UI
 */
const initBusyStore = () => {
  const { subscribe, update } = writable<Set<BusyStateInitiator>>(new Set());

  return {
    subscribe,

    /**
     * Show the busy-screen if not visible
     */
    start(initiator: BusyStateInitiator) {
      update((state) => state.add(initiator));
    },

    /**
     * Hide the busy-screen if no other initiators are done
     */
    stop(initiator: BusyStateInitiator) {
      update((state) => {
        state.delete(initiator);
        return state;
      });
    },
  };
};

export const busyStore = initBusyStore();
