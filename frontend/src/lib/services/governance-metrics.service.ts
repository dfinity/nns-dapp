import { governanceApiService } from "$lib/api-services/governance.api-service";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { queryAndUpdate } from "$lib/services/utils.services";
import { governanceMetricsStore } from "$lib/stores/governance-metrics.store";
import type { GovernanceCachedMetrics } from "@dfinity/nns";

export const loadGovernanceMetrics = async (): Promise<void> => {
  return queryAndUpdate<GovernanceCachedMetrics, unknown>({
    strategy: FORCE_CALL_STRATEGY,
    request: (options) => governanceApiService.getGovernanceMetrics(options),
    onLoad: ({ response: metrics, certified }) => {
      governanceMetricsStore.setMetrics({
        metrics,
        certified,
      });
    },
    onError: ({ error: err }) => {
      console.error(err);
      // We swallow the error because the reward event is not critical to the app.
    },
    logMessage: "Getting Governance metrics",
  });
};
