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
  | "nnsSignOut"
  | "startCyclesTimer"
  | "stopCyclesTimer";

export type PostMessageResponse = "syncCanister" | "signOutIdleTimer";

export interface PostMessage<
  T extends PostMessageDataRequest | PostMessageDataResponse
> {
  msg: PostMessageRequest | PostMessageResponse;
  data: T;
}
