import type { CanisterSync } from "$lib/types/canister";
import type { PostMessageData } from "$lib/types/post-messages";

export interface PostMessageDataCyclesRequest extends PostMessageData {
  canisterId: string;
}

export interface PostMessageDataResponseMetrics extends PostMessageData {
  canister: CanisterSync;
}
