import type { definite_canister_settings } from "@dfinity/agent/lib/esm/canisters/management_service";
export type CanisterStatus =
  | { stopped: null }
  | { stopping: null }
  | { running: null };
export type CanisterStatusResponse = {
  status: CanisterStatus;
  memory_size: bigint;
  cycles: bigint;
  settings: definite_canister_settings;
  module_hash: [] | [Array<number>];
};
