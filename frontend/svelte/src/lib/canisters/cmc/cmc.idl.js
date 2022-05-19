export const idlFactory = ({ IDL }) => {
  const IcpXdrConversionRate = IDL.Record({
    xdr_permyriad_per_icp: IDL.Nat64,
    timestamp_seconds: IDL.Nat64,
  });
  const IcpXdrConversionRateResponse = IDL.Record({
    certificate: IDL.Vec(IDL.Nat8),
    data: IcpXdrConversionRate,
    hash_tree: IDL.Vec(IDL.Nat8),
  });
  const BlockIndex = IDL.Nat64;
  const NotifyCreateCanisterArg = IDL.Record({
    controller: IDL.Principal,
    block_index: BlockIndex,
  });
  const NotifyError = IDL.Variant({
    Refunded: IDL.Record({
      block_index: IDL.Opt(BlockIndex),
      reason: IDL.Text,
    }),
    InvalidTransaction: IDL.Text,
    Other: IDL.Record({
      error_message: IDL.Text,
      error_code: IDL.Nat64,
    }),
    Processing: IDL.Null,
    TransactionTooOld: BlockIndex,
  });
  const NotifyCreateCanisterResult = IDL.Variant({
    Ok: IDL.Principal,
    Err: NotifyError,
  });
  const NotifyTopUpArg = IDL.Record({
    block_index: BlockIndex,
    canister_id: IDL.Principal,
  });
  const Cycles = IDL.Nat;
  const NotifyTopUpResult = IDL.Variant({ Ok: Cycles, Err: NotifyError });
  return IDL.Service({
    get_icp_xdr_conversion_rate: IDL.Func(
      [],
      [IcpXdrConversionRateResponse],
      ["query"]
    ),
    notify_create_canister: IDL.Func(
      [NotifyCreateCanisterArg],
      [NotifyCreateCanisterResult],
      []
    ),
    notify_top_up: IDL.Func([NotifyTopUpArg], [NotifyTopUpResult], []),
  });
};
// Remove param `{ IDL }` because TS was complaining of unused variable
export const init = () => {
  return [];
};
