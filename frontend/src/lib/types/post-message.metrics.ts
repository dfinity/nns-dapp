import type { MetricsSync } from "$lib/types/metrics";
import type { PostMessageDataResponse } from "$lib/types/post-messages";

export interface PostMessageDataResponseMetrics
  extends PostMessageDataResponse {
  metrics: MetricsSync;
}
