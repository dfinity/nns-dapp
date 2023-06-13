export type PostMessageRequest =
  | "nnsStartIdleTimer"
  | "nnsStopIdleTimer"
  | "nnsStartMetricsTimer"
  | "nnsStopMetricsTimer"
  | "nnsStartCyclesTimer"
  | "nnsStopCyclesTimer";

export type PostMessageResponse =
  | "nnsSignOut"
  | "nnsSyncMetrics"
  | "nnsSyncCanister"
  | "nnsDelegationRemainingTime";

export type PostMessageData = object;

export interface PostMessageFetchBase extends PostMessageData {
  host: string;
  fetchRootKey: boolean;
}

export interface PostMessage<T extends PostMessageData> {
  msg: PostMessageRequest | PostMessageResponse;
  data: T;
}
