import type { Agent } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import type { _SERVICE } from "./ic-management.types";

export interface ICMgtCanisterOptions {
  // The agent to use when communicating with the governance canister.
  agent: Agent;
  // The CMC canister's ID.
  canisterId: Principal;
  // The default service to use when calling into the IC. Primarily overridden
  // in test for mocking.
  serviceOverride?: _SERVICE;
}

export interface CanisterSettings {
  controllers: string[];
  freezingThreshold: bigint;
  memoryAllocation: bigint;
  computeAllocation: bigint;
}

export enum CanisterStatus {
  Stopped,
  Stopping,
  Running,
}

export interface CanisterDetails {
  id: Principal;
  status: CanisterStatus;
  memorySize: bigint;
  cycles: bigint;
  setting: CanisterSettings;
  moduleHash?: ArrayBuffer;
}
