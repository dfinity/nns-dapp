import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Principal } from "@dfinity/principal";

export const querySnsMetrics = async ({
  swapCanisterId,
}: {
  swapCanisterId: Principal;
}): Promise<number | undefined> => {
  logWithTimestamp("Loading SNS metrics...");

  const url = `https://${swapCanisterId.toText()}.raw.ic0.app/metrics`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Error loading SNS metrics");
  }

  try {
    const rawMetrics = await response.text();
    return parseSnsSwapSaleBuyerCount(rawMetrics);

    logWithTimestamp("Loading SNS metrics completed");
  } catch (err) {
    console.error("Error converting data", err);
    throw new Error("Error converting data from aggregator canister");
  }
};

/**
 * Exported for testing purposes
 *
 * @example text
 * ...
 * # TYPE sale_buyer_count gauge
 * sale_buyer_count 33 1677707139456
 * # HELP sale_cf_participants_count
 * ...
 */
export const parseSnsSwapSaleBuyerCount = (
  text: string
): number | undefined => {
  const value = Number(
    text
      .split("\n")
      ?.find((line) => line.startsWith("sale_buyer_count "))
      ?.split(/\s/)?.[1]
  );
  return isNaN(value) ? undefined : value;
};
