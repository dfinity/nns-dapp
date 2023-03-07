import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Principal } from "@dfinity/principal";

// TODO(Maks): rename: querySwapMetrics
export const querySnsSwapMetrics = async ({
  swapCanisterId,
}: {
  swapCanisterId: Principal;
}): Promise<string | undefined> => {
  logWithTimestamp("Loading SNS metrics...");

  try {
    // TODO: switch to a metrics canister. Otherwise not testable on testnet.
    const url = `https://${swapCanisterId.toText()}.raw.ic0.app/metrics`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("response not ok");
    }

    const allMetrics = await response.text();

    logWithTimestamp("Loading SNS metrics completed");

    return allMetrics;
  } catch (err) {
    logWithTimestamp("Error getting SNS metrics", err);
  }
};
