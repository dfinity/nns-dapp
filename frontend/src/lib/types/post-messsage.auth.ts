import type { PostMessageData } from "$lib/types/post-messages";

export interface PostMessageDataResponseAuth extends PostMessageData {
  authRemainingTime: number;
}
