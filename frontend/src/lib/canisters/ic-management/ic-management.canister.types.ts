import type { Principal } from "@icp-sdk/core/principal";

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
  idleCyclesBurnedPerDay: bigint;
}
