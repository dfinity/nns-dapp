import type { Identity } from "@dfinity/agent";

export interface CanisterActorParams {
  identity: Identity;
  host: string;
  fetchRootKey: boolean;
}
