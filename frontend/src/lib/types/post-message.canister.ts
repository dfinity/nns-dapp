import type { CanisterSync } from "$lib/types/canister";
import type {
  PostMessageData,
  PostMessageDataActor,
} from "$lib/types/post-messages";

export interface PostMessageDataRequestCycles extends PostMessageDataActor {
  canisterId: string;
}

export interface PostMessageDataResponseCycles extends PostMessageData {
  canister: CanisterSync;
}
