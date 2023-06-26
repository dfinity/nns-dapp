import type { SyncState } from "$lib/types/sync";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";

export type SyncStoreDataKey = "balances" | "transactions";

export type SyncStoreData = Record<SyncStoreDataKey, SyncState>;

export interface SyncStore extends Readable<SyncStoreData> {
  setState: (data: { key: SyncStoreDataKey; state: SyncState }) => void;
  reset: () => void;
}

/**
 * A store that holds the current status of the synchronization status of the jobs performed in Web Workers.
 */
const initSyncStore = (): SyncStore => {
  const INITIAL_STATE: SyncStoreData = {
    balances: "idle",
    transactions: "idle",
  } as const;

  const { subscribe, update, set } = writable<SyncStoreData>(INITIAL_STATE);

  return {
    subscribe,

    setState({ key, state }: { key: SyncStoreDataKey; state: SyncState }) {
      update((currentState: SyncStoreData) => ({
        ...currentState,
        [key]: state,
      }));
    },

    // For test purpose only
    reset: () => {
      set(INITIAL_STATE);
    },
  };
};

export const syncStore = initSyncStore();
