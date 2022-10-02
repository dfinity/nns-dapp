import type { Agent, ManagementCanisterRecord } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";

export interface ICMgtCanisterOptions {
  // The agent to use when communicating with the governance canister.
  agent: Agent;
  // The default service to use when calling into the IC. Primarily overridden
  // in test for mocking.
  serviceOverride?: ManagementCanisterRecord;
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
  settings: CanisterSettings;
  moduleHash?: ArrayBuffer;
}
