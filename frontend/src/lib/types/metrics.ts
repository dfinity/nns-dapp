import type { TvlResult } from "$lib/canisters/tvl/tvl.types";
import type { DashboardMessageExecutionRateResponse } from "$lib/types/dashboard";

export interface MetricsSync {
  tvl?: TvlResult;
  transactionRate?: DashboardMessageExecutionRateResponse;
}

export type MetricsSyncConfigLoad = "once" | "sync";

export interface MetricsSyncConfig {
  tvl: MetricsSyncConfigLoad;
  transactionRate: MetricsSyncConfigLoad;
}
