import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
import { CanisterStatus } from "$lib/canisters/ic-management/ic-management.canister.types";
import type { CanisterStatusResponse } from "@dfinity/ic-management";
import type { Principal } from "@dfinity/principal";

const getCanisterStatus = (
  status:
    | {
        stopped: null;
      }
    | {
        stopping: null;
      }
    | {
        running: null;
      }
): CanisterStatus => {
  if ("stopped" in status) {
    return CanisterStatus.Stopped;
  } else if ("stopping" in status) {
    return CanisterStatus.Stopping;
  } else if ("running" in status) {
    return CanisterStatus.Running;
  }
  throw new Error(status);
};

export const toCanisterDetails = ({
  response: {
    memory_size,
    status,
    cycles,
    settings,
    module_hash,
    idle_cycles_burned_per_day,
  },
  canisterId,
}: {
  response: CanisterStatusResponse;
  canisterId: Principal;
}): CanisterDetails => ({
  id: canisterId,
  status: getCanisterStatus(status),
  memorySize: memory_size,
  cycles: cycles,
  settings: {
    controllers: settings.controllers.map((principal) => principal.toText()),
    freezingThreshold: settings.freezing_threshold,
    memoryAllocation: settings.memory_allocation,
    computeAllocation: settings.compute_allocation,
  },
  moduleHash:
    module_hash.length > 0 && module_hash[0] !== undefined
      ? new Uint8Array(module_hash[0]).buffer
      : undefined,
  idleCyclesBurnedPerDay: idle_cycles_burned_per_day,
});
