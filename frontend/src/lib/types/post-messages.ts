import type { CanisterSync } from "$lib/types/canister";

export interface PostMessageDataRequest {
  canisterIds: string[];
}

export interface PostMessageDataResponse {
  canister?: CanisterSync;
}

export type PostMessageRequest =
  | "nnsStartIdleTimer"
  | "nnsStopIdleTimer"
  | "nnsStartCyclesTimer"
  | "nnsStopCyclesTimer";

export type PostMessageResponse = "nnsSyncCanister" | "nnsSignOut";

export interface PostMessage<
  T extends PostMessageDataRequest | PostMessageDataResponse
> {
  msg: PostMessageRequest | PostMessageResponse;
  data: T;
}
