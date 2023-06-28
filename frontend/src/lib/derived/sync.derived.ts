import {
  syncStore,
  type SyncStore,
  type SyncStoreData,
} from "$lib/stores/sync.store";
import type { SyncState } from "$lib/types/sync";
import { derived } from "svelte/store";

/**
 * A derived store for the sync status that returns a global status.
 * If any sync is in error, it returns error. Likewise for progress and idle.
 */
export const syncOverallStatusStore = derived<SyncStore, SyncState>(
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
