import type { CanisterSync } from "$lib/types/canister";
import type { PostMessageData } from "$lib/types/post-messages";

export interface PostMessageDataRequestCycles extends PostMessageData {
  canisterId: string;
}

export interface PostMessageDataResponseCycles extends PostMessageData {
  canister: CanisterSync;
}
