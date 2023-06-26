import type { PostMessageData } from "$lib/types/post-messages";
import type { SyncState } from "$lib/types/sync";

export interface PostMessageDataResponseSync extends PostMessageData {
  state: SyncState;
}
