import type { StakingMetricData, StakingMetrics } from "$lib/types/dashboard";

// TODO: extract .env
const DASHBOARD_API_URL = "https://ic-api.internetcomputer.org/api/v3";

/**
 * Staking metrics through with the help of the IC dashboard.
 *
 * Documentation:
 * - https://ic-api.internetcomputer.org/api/v3/swagger
 */
export const dissolvingTotalNeuronsCount = async (
  dissolving: boolean
): Promise<StakingMetrics | null> => {
  try {
    const { name: metric }: Pick<StakingMetricData, "name"> = {
      name: dissolving
        ? "governance_dissolving_neurons_e8s_count"
        : "governance_not_dissolving_neurons_e8s_count",
    };

    const response = await fetch(
      `${DASHBOARD_API_URL}/staking-metrics/${metric}`
    );
    if (!response.ok) {
      // We silence any error here - if no result is found, no informative information shall be displayed
      console.error(
        `Error fetching total ${
          dissolving ? "" : "not "
        } dissolving neurons count`,
        response
      );
      return null;
    }

    return response.json();
  } catch (err: unknown) {
    // We silence any error here - if no result is found, no informative information shall be displayed
    console.error(
      `Unexpected error fetching total ${
        dissolving ? "" : "not "
      } dissolving neurons count`,
      err
    );
    return null;
  }
};
