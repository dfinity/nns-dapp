import type { CanisterSync } from "$lib/types/canister";
import type {
  PostMessageDataRequest,
  PostMessageDataResponse,
} from "$lib/types/post-messages";

export interface PostMessageDataCyclesRequest extends PostMessageDataRequest {
  canisterId: string;
}

export interface PostMessageDataResponseMetrics
  extends PostMessageDataResponse {
  canister: CanisterSync;
}
