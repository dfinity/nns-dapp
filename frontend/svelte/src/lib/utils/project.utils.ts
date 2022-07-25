import type { SnsSwapTimeWindow } from "@dfinity/sns";
import type { SnsSummarySwap } from "../types/sns";
import { nowInSeconds } from "./date.utils";
import { fromNullable } from "./did.utils";

const openTimeWindow = ({
  state: { open_time_window },
}: SnsSummarySwap): SnsSwapTimeWindow | undefined =>
  fromNullable(open_time_window);

/**
 * Duration in seconds until the end of the swap if defined.
 * @param swap
 */
export const durationTillSwapDeadline = (
  swap: SnsSummarySwap
): bigint | undefined => {
  const timeWindow: SnsSwapTimeWindow | undefined = openTimeWindow(swap);

  // e.g. proposal to start swap has not been accepted yet
  if (timeWindow === undefined) {
    return undefined;
  }

  const { end_timestamp_seconds } = timeWindow;
  return end_timestamp_seconds - BigInt(nowInSeconds());
};

/**
 * If defined the duration of the swap in seconds - i.e. the duration from start till end
 * @param swap
 */
export const swapDuration = (swap: SnsSummarySwap): bigint | undefined => {
  const timeWindow: SnsSwapTimeWindow | undefined = openTimeWindow(swap);

  // e.g. proposal to start swap has not been accepted yet
  if (timeWindow === undefined) {
    return undefined;
  }

  const { start_timestamp_seconds, end_timestamp_seconds } = timeWindow;
  return end_timestamp_seconds - start_timestamp_seconds;
};

/**
 * If defined the duration until the swap start in seconds
 * @param swap
 */
export const durationTillSwapStart = (
  swap: SnsSummarySwap
): bigint | undefined => {
  const timeWindow: SnsSwapTimeWindow | undefined = openTimeWindow(swap);

  // e.g. proposal to start swap has not been accepted yet
  if (timeWindow === undefined) {
    return undefined;
  }

  const { start_timestamp_seconds } = timeWindow;
  return BigInt(nowInSeconds()) - start_timestamp_seconds;
};
