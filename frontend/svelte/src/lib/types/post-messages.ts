import type { LocalStorageAuth } from "./auth";

export interface PostMessageEventData {
  msg: "nnsStartIdleTimer" | "nnsStopIdleTimer" | "nnsSignOut";
  data?: LocalStorageAuth;
}
