import type { GetTVLResult } from "$lib/canisters/tvl/tvl.canister.types";
import type { DashboardMessageExecutionRateResponse } from "$lib/types/dashboard";

export interface MetricsSync {
  tvl?: GetTVLResult;
  transactionRate?: DashboardMessageExecutionRateResponse;
}

export type MetricsSyncConfigLoad = "once" | "sync";

export interface MetricsSyncConfig {
  tvl: MetricsSyncConfigLoad;
  transactionRate: MetricsSyncConfigLoad;
}
