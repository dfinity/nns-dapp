import type { Principal } from "@dfinity/principal";
export type canister_id = Principal;
export interface canister_settings {
  freezing_threshold: [] | [bigint];
  controllers: [] | [Array<Principal>];
  memory_allocation: [] | [bigint];
  compute_allocation: [] | [bigint];
}
export interface definite_canister_settings {
  freezing_threshold: bigint;
  controllers: Array<Principal>;
  memory_allocation: bigint;
  compute_allocation: bigint;
}
export type user_id = Principal;
export type wasm_module = Array<number>;
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
export interface _SERVICE {
  canister_status: (arg_0: {
    canister_id: canister_id;
  }) => Promise<CanisterStatusResponse>;
  create_canister: (arg_0: {
    settings: [] | [canister_settings];
  }) => Promise<{ canister_id: canister_id }>;
  delete_canister: (arg_0: { canister_id: canister_id }) => Promise<undefined>;
  deposit_cycles: (arg_0: { canister_id: canister_id }) => Promise<undefined>;
  install_code: (arg_0: {
    arg: Array<number>;
    wasm_module: wasm_module;
    mode: { reinstall: null } | { upgrade: null } | { install: null };
    canister_id: canister_id;
  }) => Promise<undefined>;
  provisional_create_canister_with_cycles: (arg_0: {
    settings: [] | [canister_settings];
    amount: [] | [bigint];
  }) => Promise<{ canister_id: canister_id }>;
  provisional_top_up_canister: (arg_0: {
    canister_id: canister_id;
    amount: bigint;
  }) => Promise<undefined>;
  raw_rand: () => Promise<Array<number>>;
  start_canister: (arg_0: { canister_id: canister_id }) => Promise<undefined>;
  stop_canister: (arg_0: { canister_id: canister_id }) => Promise<undefined>;
  uninstall_code: (arg_0: { canister_id: canister_id }) => Promise<undefined>;
  update_settings: (arg_0: {
    canister_id: Principal;
    settings: canister_settings;
  }) => Promise<undefined>;
}
