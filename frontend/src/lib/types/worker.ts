import type { CanisterId } from "$lib/types/canister";
import type { Identity } from "@dfinity/agent";

export interface CanisterActorParams {
  canisterId: CanisterId | string;
  identity: Identity;
  host: string;
  fetchRootKey: boolean;
}
