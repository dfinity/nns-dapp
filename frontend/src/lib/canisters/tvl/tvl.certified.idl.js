/* Do not edit.  Compiled with ./scripts/compile-idl-js from packages/tvl/candid/tvl.did */
export const idlFactory = ({ IDL }) => {
  const InitArgs = IDL.Record({
    governance_id: IDL.Principal,
    update_period: IDL.Nat64,
    xrc_id: IDL.Principal,
  });
  const TimeseriesEntry = IDL.Record({
    value: IDL.Nat,
    time_sec: IDL.Nat,
  });
  const TimeseriesResult = IDL.Record({
    timeseries: IDL.Vec(TimeseriesEntry),
  });
  const TvlResult = IDL.Record({ tvl: IDL.Nat, time_sec: IDL.Nat });
  const TvlResultError = IDL.Record({ message: IDL.Text });
  const Result_tvl = IDL.Variant({ Ok: TvlResult, Err: TvlResultError });
  const TvlTimeseriesResult = IDL.Record({ timeseries: IDL.Vec(TvlResult) });
  return IDL.Service({
    get_locked_e8s_timeseries: IDL.Func([], [TimeseriesResult], []),
    get_tvl: IDL.Func([], [Result_tvl], []),
    get_tvl_timeseries: IDL.Func([], [TvlTimeseriesResult], []),
    get_xr_timeseries: IDL.Func([], [TimeseriesResult], []),
  });
};
export const init = ({ IDL }) => {
  const InitArgs = IDL.Record({
    governance_id: IDL.Principal,
    update_period: IDL.Nat64,
    xrc_id: IDL.Principal,
  });
  return [InitArgs];
};
