import type { SnsGetAutoFinalizationStatusResponse } from "@dfinity/sns";

export const snsFinalizationStatusResponseMock: SnsGetAutoFinalizationStatusResponse =
  {
    auto_finalize_swap_response: [],
    has_auto_finalize_been_attempted: [false],
    is_auto_finalize_enabled: [true],
  };

export const createFinalizationStatusMock = (
  isFinalizing: boolean
): SnsGetAutoFinalizationStatusResponse => ({
  is_auto_finalize_enabled: [true],
  // This needs to be empty.
  // Check `isSnsFinalizing` sns util for more details
  auto_finalize_swap_response: [],
  has_auto_finalize_been_attempted: [isFinalizing],
});
