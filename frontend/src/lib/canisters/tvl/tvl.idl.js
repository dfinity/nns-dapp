/* Do not edit.  Compiled with ./scripts/compile-idl-js from packages/tvl/candid/tvl.did */
export const idlFactory = ({ IDL }) => {
  const TvlArgs = IDL.Record({
    governance_id: IDL.Opt(IDL.Principal),
    update_period: IDL.Opt(IDL.Nat64),
    xrc_id: IDL.Opt(IDL.Principal),
  });
  const FiatCurrency = IDL.Variant({
    CNY: IDL.Null,
    EUR: IDL.Null,
    GBP: IDL.Null,
    JPY: IDL.Null,
  });
  const TvlRequest = IDL.Record({ currency: FiatCurrency });
  const TvlResult = IDL.Record({ tvl: IDL.Nat, time_sec: IDL.Nat });
  const TvlResultError = IDL.Record({ message: IDL.Text });
  const Result = IDL.Variant({ Ok: TvlResult, Err: TvlResultError });
  const HttpRequest = IDL.Record({
    url: IDL.Text,
    method: IDL.Text,
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
  });
  const HttpResponse = IDL.Record({
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    status_code: IDL.Nat16,
  });
  return IDL.Service({
    get_tvl: IDL.Func([IDL.Opt(TvlRequest)], [Result], ["query"]),
    http_request: IDL.Func([HttpRequest], [HttpResponse], ["query"]),
  });
};
export const init = ({ IDL }) => {
  const TvlArgs = IDL.Record({
    governance_id: IDL.Opt(IDL.Principal),
    update_period: IDL.Opt(IDL.Nat64),
    xrc_id: IDL.Opt(IDL.Principal),
  });
  return [TvlArgs];
};
