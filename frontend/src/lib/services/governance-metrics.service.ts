import { governanceApiService } from "$lib/api-services/governance.api-service";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { governanceMetricsStore } from "$lib/stores/governance-metrics.store";

export const loadGovernanceMetrics = async (): Promise<void> => {
  try {
    const identity = await getAuthenticatedIdentity();
    const certified = true;
    const parameters = await governanceApiService.getGovernanceMetrics({
      identity,
      certified,
    });

    governanceMetricsStore.setParameters({
      parameters,
      certified,
    });
  } catch (error) {
    console.error(error);
  }
};
