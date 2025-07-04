import { governanceApiService } from "$lib/api-services/governance.api-service";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { queryAndUpdate } from "$lib/services/utils.services";
import { networkEconomicsStore } from "$lib/stores/network-economics.store";
import type { NetworkEconomics } from "@dfinity/nns";

export const loadNetworkEconomicsParameters = async (): Promise<void> => {
  return queryAndUpdate<NetworkEconomics, unknown>({
    strategy: FORCE_CALL_STRATEGY,
    request: (options) =>
      governanceApiService.getNetworkEconomicsParameters(options),
    onLoad: ({ response: parameters, certified }) => {
      networkEconomicsStore.setParameters({
        parameters,
        certified,
      });
    },
    onError: ({ error: err }) => {
      console.error(err);
      // We swallow the error because the reward event is not critical to the app.
    },
    logMessage: "Getting latest reward event for NNS",
  });
};
