import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";

export type CanisterSyncStatus = "syncing" | "synced" | "error";

export type CanisterCyclesStatus = "ok" | "empty";

export interface CanisterSync {
  id: string;
  sync: CanisterSyncStatus;
  cyclesStatus?: CanisterCyclesStatus;
  data?: CanisterDetails;
}
