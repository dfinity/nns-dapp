import {
  syncStore,
  type SyncStore,
  type SyncStoreData,
} from "$lib/stores/sync.store";
import type { SyncState } from "$lib/types/sync";
import { derived } from "svelte/store";

export const workersSyncStore = derived<SyncStore, SyncState>(
  syncStore,
  ({ transactions, balances }: SyncStoreData) => {
    if (transactions === "error" || balances === "error") {
      return "error";
    }

    if (transactions === "in_progress" || balances === "in_progress") {
      return "in_progress";
    }

    return "idle";
  }
);
