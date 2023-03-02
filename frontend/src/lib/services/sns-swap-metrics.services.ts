import { wrapper } from "$lib/api/sns-wrapper.api";
import { getCurrentIdentity } from "$lib/services/auth.services";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Principal } from "@dfinity/principal";

export const querySnsMetrics = async ({
  rootCanisterId,
}: {
  rootCanisterId: Principal;
}): Promise<number | undefined> => {
  logWithTimestamp("Loading SNS metrics...");

  try {
    const identity = await getCurrentIdentity();
    const { canisterIds } = await wrapper({
      identity,
      rootCanisterId: rootCanisterId.toText(),
      certified: false,
    });
    const { swapCanisterId } = canisterIds;
    const url = `https://${"2hx64-daaaa-aaaaq-aaana-cai"}.raw.ic0.app/metrics`;
    // const url = `https://${swapCanisterId.toText()}.raw.ic0.app/metrics`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Error loading SNS metrics");
    }

    const rawMetrics = await response.text();
    return parseSnsSwapSaleBuyerCount(rawMetrics);

    logWithTimestamp("Loading SNS metrics completed");
  } catch (err) {
    console.error("Error getting SNS metrics", err);
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
