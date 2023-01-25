// TODO: Extract .env
const GOVERNANCE_CANISTER_RAW_URL =
  "https://rrkah-fqaaa-aaaaa-aaaaq-cai.raw.ic0.app";

/**
 * Metrics of the Governance canister.
 */
export const governanceMetrics = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${GOVERNANCE_CANISTER_RAW_URL}/metrics`);
    if (!response.ok) {
      // We silence any error here - if no result is found, no informative information shall be displayed
      console.error("Error fetching the governance metrics", response);
      return null;
    }

    return response.text();
  } catch (err: unknown) {
    // We silence any error here - if no result is found, no informative information shall be displayed
    console.error("Unexpected error fetching the governance metrics", err);
    return null;
  }
};
