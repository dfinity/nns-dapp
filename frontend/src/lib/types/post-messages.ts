import type { DashboardSync } from "$lib/types/dashboard";

export type PostMessageRequest =
  | "nnsStartIdleTimer"
  | "nnsStopIdleTimer"
  | "nnsStartDashboardTimer"
  | "nnsStopDashboardTimer";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PostMessageDataRequest {}

export interface PostMessageDataResponse {
  dashboard?: DashboardSync;
}

export type PostMessageResponse = "nnsSignOut" | "nnsSyncDashboard";

export interface PostMessage<T extends PostMessageDataResponse> {
  msg: PostMessageRequest | PostMessageResponse;
  data: T;
}
