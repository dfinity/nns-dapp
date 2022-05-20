import { UnsupportedValueError } from "@dfinity/nns";
import type { CanisterDetails } from "./ic-management.canister.types";
import { CanisterStatus } from "./ic-management.canister.types";
import type { CanisterStatusResponse } from "./ic-management.types";

const getCanisterStatus = (
  rawResponse: CanisterStatusResponse
): CanisterStatus => {
  if ("stopped" in rawResponse.status) {
    return CanisterStatus.Stopped;
  } else if ("stopping" in rawResponse.status) {
    return CanisterStatus.Stopping;
  } else if ("running" in rawResponse.status) {
    return CanisterStatus.Running;
  }
  throw new UnsupportedValueError(rawResponse.status);
};

export const toCanisterDetails = (
  res: CanisterStatusResponse
): CanisterDetails => ({
  status: getCanisterStatus(res),
  memorySize: res.memory_size,
  cycles: res.cycles,
  setting: {
    controllers: res.settings.controllers.map((principal) =>
      principal.toText()
    ),
    freezingThreshold: res.settings.freezing_threshold,
    memoryAllocation: res.settings.memory_allocation,
    computeAllocation: res.settings.compute_allocation,
  },
  moduleHash:
    res.module_hash.length > 0 && res.module_hash[0] !== undefined
      ? new Uint8Array(res.module_hash[0]).buffer
      : undefined,
});
