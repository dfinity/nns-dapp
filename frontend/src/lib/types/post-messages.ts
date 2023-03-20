import type { CanisterSync } from "$lib/types/canister";
import type { MetricsSync } from "$lib/types/metrics";

export type PostMessageRequest =
  | "nnsStartIdleTimer"
  | "nnsStopIdleTimer"
  | "nnsStartMetricsTimer"
  | "nnsStopMetricsTimer"
  | "nnsStartCyclesTimer"
  | "nnsStopCyclesTimer";

export interface PostMessageDataRequest {
  canisterId: string;
}

export interface PostMessageDataResponse {
  metrics?: MetricsSync;
  canister?: CanisterSync;
  authRemainingTime?: number;
}

export type PostMessageResponse =
  | "nnsSignOut"
  | "nnsSyncMetrics"
  | "nnsSyncCanister"
  | "nnsDelegationRemainingTime";

export interface PostMessage<
  T extends PostMessageDataResponse | PostMessageDataRequest
> {
  msg: PostMessageRequest | PostMessageResponse;
  data: T;
}
