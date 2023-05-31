import type { PostMessageDataResponse } from "$lib/types/post-messages";

export interface PostMessageDataResponseMetrics
  extends PostMessageDataResponse {
  authRemainingTime: number;
}
