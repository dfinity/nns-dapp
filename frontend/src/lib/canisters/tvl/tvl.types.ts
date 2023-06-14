import type { ActorMethod } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";

export type FiatCurrency =
  | { CNY: null }
  | { EUR: null }
  | { GBP: null }
  | { JPY: null };
export interface HttpRequest {
  url: string;
  method: string;
  body: Uint8Array;
  headers: Array<[string, string]>;
}
export interface HttpResponse {
  body: Uint8Array;
  headers: Array<[string, string]>;
  status_code: number;
}
export type Result = { Ok: TvlResult } | { Err: TvlResultError };
export interface TvlArgs {
  governance_id: [] | [Principal];
  update_period: [] | [bigint];
  xrc_id: [] | [Principal];
}
export interface TvlRequest {
  currency: FiatCurrency;
}
export interface TvlResult {
  tvl: bigint;
  time_sec: bigint;
}
export interface TvlResultError {
  message: string;
}
export interface _SERVICE {
  get_tvl: ActorMethod<[[] | [TvlRequest]], Result>;
  http_request: ActorMethod<[HttpRequest], HttpResponse>;
}
