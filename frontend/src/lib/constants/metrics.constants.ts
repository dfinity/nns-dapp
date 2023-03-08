import { SECONDS_IN_MINUTE } from "$lib/constants/constants";
import type { MetricsSyncConfig } from "$lib/types/metrics";

// Workers periodicity
export const SYNC_METRICS_TIMER_INTERVAL = SECONDS_IN_MINUTE * 1000;

export const SYNC_METRICS_CONFIG: MetricsSyncConfig = {
  // Currently we load the TVL only once because the TVL canister gets the ICP <> dollar ratio three times a day and the governance canister updates the TVL metrics once a day.
  // We might revert this to a more dynamic data in the future, that's why we keep the feature in the worker.
  tvl: "once",
  transactionRate: "sync",
};
