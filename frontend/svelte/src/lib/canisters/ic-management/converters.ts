import { UnsupportedValueError } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
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

export const toCanisterDetails = ({
  response,
  canisterId,
}: {
  response: CanisterStatusResponse;
  canisterId: Principal;
}): CanisterDetails => ({
  id: canisterId,
  status: getCanisterStatus(response),
  memorySize: response.memory_size,
  cycles: response.cycles,
  setting: {
    controllers: response.settings.controllers.map((principal) =>
      principal.toText()
    ),
    freezingThreshold: response.settings.freezing_threshold,
    memoryAllocation: response.settings.memory_allocation,
    computeAllocation: response.settings.compute_allocation,
  },
  moduleHash:
    response.module_hash.length > 0 && response.module_hash[0] !== undefined
      ? new Uint8Array(response.module_hash[0]).buffer
      : undefined,
});
