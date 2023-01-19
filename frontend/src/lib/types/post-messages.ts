import type { MetricsSync } from "$lib/types/metrics";

export type PostMessageRequest =
  | "nnsStartIdleTimer"
  | "nnsStopIdleTimer"
  | "nnsStartMetricsTimer"
  | "nnsStopMetricsTimer";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PostMessageDataRequest {}

export interface PostMessageDataResponse {
  metrics?: MetricsSync;
}

export type PostMessageResponse = "nnsSignOut" | "nnsSyncMetrics";

export interface PostMessage<T extends PostMessageDataResponse> {
  msg: PostMessageRequest | PostMessageResponse;
  data: T;
}
