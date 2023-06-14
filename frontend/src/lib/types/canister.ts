import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";

export type CanisterSyncStatus = "syncing" | "synced" | "error";

export type CanisterCyclesStatus = "ok" | "empty";

export interface CanisterSync {
  id: string;
  sync: CanisterSyncStatus;
  cyclesStatus?: CanisterCyclesStatus;
  data?: CanisterDetails;
}

export type CanisterId = Principal;

export interface CanisterActorParams {
  canisterId: CanisterId | string;
  identity: Identity;
  host: string;
  fetchRootKey: boolean;
}
