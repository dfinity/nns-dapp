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
  auto_finalize_swap_response: isFinalizing
    ? []
    : [
        {
          set_dapp_controllers_call_result: [],
          settle_community_fund_participation_result: [],
          error_message: [],
          set_mode_call_result: [],
          sweep_icp_result: [],
          claim_neuron_result: [],
          sweep_sns_result: [],
        },
      ],
  has_auto_finalize_been_attempted: isFinalizing ? [true] : [false],
});
