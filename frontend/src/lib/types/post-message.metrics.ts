import type { MetricsSync } from "$lib/types/metrics";
import type {
  PostMessageData,
  PostMessageDataActor,
} from "$lib/types/post-messages";

export interface PostMessageDataRequestMetrics extends PostMessageDataActor {
  tvlCanisterId: string | undefined;
}

export interface PostMessageDataResponseMetrics extends PostMessageData {
  metrics: MetricsSync;
}
