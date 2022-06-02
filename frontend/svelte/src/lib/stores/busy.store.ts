import { derived, writable, type Readable } from "svelte/store";

export type BusyStateInitiatorType =
  | "stake-neuron"
  | "update-delay"
  | "vote"
  | "attach-canister"
  | "create-canister"
  | "top-up-canister"
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
  | "disburse-neuron";

export interface BusyState {
  initiator: BusyStateInitiatorType;
  labelKey?: string;
}

/**
 * Store that reflects the app busy state.
 * Is used to show the busy-screen that locks the UI.
 */
const initBusyStore = () => {
  const { subscribe, update } = writable<Array<BusyState>>([]);

  return {
    subscribe,

    /**
     * Show the busy-screen if not visible
     */
    startBusy({ initiator: newInitiator, labelKey }: BusyState) {
      update((state) => [
        ...state.filter(({ initiator }) => newInitiator !== initiator),
        { initiator: newInitiator, labelKey },
      ]);
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

// Returns the newest message that was added to the store
export const busyMessageKey: Readable<string | undefined> = derived(
  busyStore,
  ($busyStore) =>
    $busyStore.reverse().find(({ labelKey }) => labelKey !== undefined)
      ?.labelKey
);
