import type { MetricsSync } from "$lib/types/metrics";
import type {
  PostMessageData,
  PostMessageDataActor,
} from "$lib/types/post-messages";

export type PostMessageDataRequestMetrics = PostMessageDataActor;

export interface PostMessageDataResponseMetrics extends PostMessageData {
  metrics: MetricsSync;
}
