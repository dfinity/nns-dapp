export type PostMessageRequest =
  | "nnsStartIdleTimer"
  | "nnsStopIdleTimer"
  | "nnsStartMetricsTimer"
  | "nnsStopMetricsTimer"
  | "nnsStartCyclesTimer"
  | "nnsStopCyclesTimer"
  | "nnsStartTransactionsTimer"
  | "nnsStopTransactionsTimer";

export type PostMessageResponse =
  | "nnsSignOut"
  | "nnsSyncMetrics"
  | "nnsSyncCanister"
  | "nnsDelegationRemainingTime"
  | "nnsSyncTransactions"
  | "nnsSyncErrorTransactions"
  | "nnsSyncStatus";

export type PostMessageData = object;

export interface PostMessageDataActor extends PostMessageData {
  host: string;
  fetchRootKey: boolean;
}

export interface PostMessage<T extends PostMessageData> {
  msg: PostMessageRequest | PostMessageResponse;
  data: T;
}
