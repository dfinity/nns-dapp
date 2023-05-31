import type { MetricsSync } from "$lib/types/metrics";
import type { PostMessageData } from "$lib/types/post-messages";

export interface PostMessageDataResponseMetrics extends PostMessageData {
  metrics: MetricsSync;
}
