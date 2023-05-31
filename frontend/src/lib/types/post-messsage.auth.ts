import type { PostMessageData } from "$lib/types/post-messages";

export interface PostMessageDataResponseMetrics extends PostMessageData {
  authRemainingTime: number;
}
