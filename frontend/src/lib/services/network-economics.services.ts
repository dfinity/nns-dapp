import { governanceApiService } from "../api-services/governance.api-service";
import { networkEconomicsStore } from "../stores/network-economics.store";
import { getAuthenticatedIdentity } from "./auth.services";

export const loadNetworkEconomicsParameters = async (): Promise<void> => {
  try {
    const identity = await getAuthenticatedIdentity();
    const parameters = await governanceApiService.getNetworkEconomicsParameters(
      {
        identity,
        certified: true,
      }
    );

    networkEconomicsStore.setParameters({
      parameters,
      certified: true,
    });
  } catch (error) {
    console.error(error);
  }
};
