export const idlFactory = ({ IDL }) => {
  const HttpRequest = IDL.Record({
    url: IDL.Text,
    method: IDL.Text,
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
  });
  const StreamingCallbackToken = IDL.Record({
    token: IDL.Opt(IDL.Text),
    sha256: IDL.Opt(IDL.Vec(IDL.Nat8)),
    headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    index: IDL.Nat64,
    encoding_type: IDL.Text,
    full_path: IDL.Text,
  });
  const StreamingStrategy = IDL.Variant({
    Callback: IDL.Record({
      token: StreamingCallbackToken,
      callback: IDL.Func([], [], []),
    }),
  });
  const HttpResponse = IDL.Record({
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    streaming_strategy: IDL.Opt(StreamingStrategy),
    status_code: IDL.Nat16,
  });
  const Meta = IDL.Record({
    url: IDL.Opt(IDL.Text),
    theme: IDL.Text,
    logo: IDL.Text,
    name: IDL.Text,
    description: IDL.Opt(IDL.Text),
  });
  return IDL.Service({
    http_request: IDL.Func([HttpRequest], [HttpResponse], ["query"]),
    meta: IDL.Func([], [Meta], ["query"]),
  });
};
export const init = ({ IDL }) => {
  return [];
};
