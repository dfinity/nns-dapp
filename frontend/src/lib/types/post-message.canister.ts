import type { CanisterSync } from "$lib/types/canister";
import type {
  PostMessageData,
  PostMessageFetchBase,
} from "$lib/types/post-messages";

export interface PostMessageDataRequestCycles extends PostMessageFetchBase {
  canisterId: string;
}

export interface PostMessageDataResponseCycles extends PostMessageData {
  canister: CanisterSync;
}
