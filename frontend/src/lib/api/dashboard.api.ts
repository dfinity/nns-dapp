import { DASHBOARD_API, NNS_SUBNET } from "$lib/constants/dashboard.constants";
import type { DashboardMessageExecutionRateResponse } from "$lib/types/dashboard";

/**
 * Transaction rate
 *
 * Documentation:
 * - https://ic-api.internetcomputer.org/api/v3/swagger
 *
 */
export const fetchTransactionRate =
  async (): Promise<DashboardMessageExecutionRateResponse> => {
    try {
      const params = new URLSearchParams({
        subnet: NNS_SUBNET,
        message_type: "update",
      });

      const response = await fetch(
        `${DASHBOARD_API}/metrics/message-execution-rate?${params}`
      );

      if (!response.ok) {
        // We silence any error here - if no result is found, no informative information shall be displayed
        console.error("Error fetching dashboard transaction rate", response);
        return null;
      }

      return response.json();
    } catch (err: unknown) {
      // We silence any error here - if no result is found, no informative information shall be displayed
      console.error(
        "Unexpected error fetching dashboard transaction rate",
        err
      );
      return null;
    }
  };
