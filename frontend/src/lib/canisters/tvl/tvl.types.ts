import type { ActorMethod } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";

export interface InitArgs {
  governance_id: Principal;
  update_period: bigint;
  xrc_id: Principal;
}
export type Result_tvl = { Ok: TvlResult } | { Err: TvlResultError };
export interface TimeseriesEntry {
  value: bigint;
  time_sec: bigint;
}
export interface TimeseriesResult {
  timeseries: Array<TimeseriesEntry>;
}
export interface TvlResult {
  tvl: bigint;
  time_sec: bigint;
}
export interface TvlResultError {
  message: string;
}
export interface TvlTimeseriesResult {
  timeseries: Array<TvlResult>;
}
export interface _SERVICE {
  get_locked_e8s_timeseries: ActorMethod<[], TimeseriesResult>;
  get_tvl: ActorMethod<[], Result_tvl>;
  get_tvl_timeseries: ActorMethod<[], TvlTimeseriesResult>;
  get_xr_timeseries: ActorMethod<[], TimeseriesResult>;
}
