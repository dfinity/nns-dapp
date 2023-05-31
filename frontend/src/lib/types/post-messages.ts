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

export type PostMessageDataRequest = object;
export type PostMessageDataResponse = object;

export interface PostMessage<
  T extends PostMessageDataResponse | PostMessageDataRequest
> {
  msg: PostMessageRequest | PostMessageResponse;
  data: T;
}
