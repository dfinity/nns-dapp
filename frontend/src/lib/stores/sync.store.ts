import type { SyncState } from "$lib/types/sync";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";

export type SyncStoreDataKey = "balances" | "transactions";

export type SyncStoreData = Record<SyncStoreDataKey, SyncState>;

export interface SyncStore extends Readable<SyncStoreData> {
  setState: (data: { key: SyncStoreDataKey; state: SyncState }) => void;
}

const initSyncStore = (): SyncStore => {
  const { subscribe, update } = writable<SyncStoreData>({
    balances: "idle",
    transactions: "idle",
  });

  return {
    subscribe,

    setState({ key, state }: { key: SyncStoreDataKey; state: SyncState }) {
      update((currentState: SyncStoreData) => ({
        ...currentState,
        [key]: state,
      }));
    },
  };
};

export const syncStore = initSyncStore();
