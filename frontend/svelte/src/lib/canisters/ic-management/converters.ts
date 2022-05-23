import { UnsupportedValueError } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type { CanisterDetails } from "./ic-management.canister.types";
import { CanisterStatus } from "./ic-management.canister.types";
import type {
  CanisterStatus as RawCanisterStatus,
  CanisterStatusResponse,
} from "./ic-management.types";

const getCanisterStatus = (status: RawCanisterStatus): CanisterStatus => {
  if ("stopped" in status) {
    return CanisterStatus.Stopped;
  } else if ("stopping" in status) {
    return CanisterStatus.Stopping;
  } else if ("running" in status) {
    return CanisterStatus.Running;
  }
  throw new UnsupportedValueError(status);
};

export const toCanisterDetails = ({
  response: { memory_size, status, cycles, settings, module_hash },
  canisterId,
}: {
  response: CanisterStatusResponse;
  canisterId: Principal;
}): CanisterDetails => ({
  id: canisterId,
  status: getCanisterStatus(status),
  memorySize: memory_size,
  cycles: cycles,
  setting: {
    controllers: settings.controllers.map((principal) => principal.toText()),
    freezingThreshold: settings.freezing_threshold,
    memoryAllocation: settings.memory_allocation,
    computeAllocation: settings.compute_allocation,
  },
  moduleHash:
    module_hash.length > 0 && module_hash[0] !== undefined
      ? new Uint8Array(module_hash[0]).buffer
      : undefined,
});
