import type { Identity } from "@icp-sdk/core/agent";

export interface CanisterActorParams {
  identity: Identity;
  host: string;
  fetchRootKey: boolean;
}
