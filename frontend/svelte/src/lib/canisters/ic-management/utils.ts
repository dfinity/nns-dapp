import { UnsupportedValueError } from "@dfinity/nns";
import { CanisterStatus } from "./ic-management.canister.types";
import type { CanisterStatusResponse } from "./ic-management.types";

export const getCanisterStatus = (
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
