import { governanceApiService } from "$lib/api-services/governance.api-service";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { networkEconomicsStore } from "$lib/stores/network-economics.store";

export const loadNetworkEconomicsParameters = async (): Promise<void> => {
  try {
    const identity = await getAuthenticatedIdentity();
    const certified = true;
    const parameters = await governanceApiService.getNetworkEconomicsParameters(
      {
        identity,
        certified,
      }
    );

    networkEconomicsStore.setParameters({
      parameters,
      certified,
    });
  } catch (error) {
    console.error(error);
  }
};
