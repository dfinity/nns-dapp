import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";

export type CanisterSyncStatus = "syncing" | "synced" | "error";

export interface CanisterSync {
  id: string;
  sync: CanisterSyncStatus;
  data?: CanisterDetails;
}
