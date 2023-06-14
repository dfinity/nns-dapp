export type PostMessageRequest =
  | "nnsStartIdleTimer"
  | "nnsStopIdleTimer"
  | "nnsStartMetricsTimer"
  | "nnsStopMetricsTimer"
  | "nnsStartCyclesTimer"
  | "nnsStopCyclesTimer"
  | "nnsStartBalancesTimer"
  | "nnsStopBalancesTimer"
  | "nnsStartTransactionsTimer"
  | "nnsStopTransactionsTimer";

export type PostMessageResponse =
  | "nnsSignOut"
  | "nnsSyncMetrics"
  | "nnsSyncCanister"
  | "nnsDelegationRemainingTime"
  | "nnsSyncTransactions"
  | "nnsSyncAccountsBalances";

export type PostMessageData = object;

export interface PostMessage<T extends PostMessageData> {
  msg: PostMessageRequest | PostMessageResponse;
  data: T;
}
