// export const idlFactoryB = ({ IDL }) => {
//   const Order = IDL.Record({
//     'id' : IDL.Nat32,
//     'status' : IDL.Variant({
//       'Cancelled' : IDL.Null,
//       'Completed' : IDL.Null,
//       'Pending' : IDL.Null,
//     }),
//     'paymentAddress' : IDL.Record({
//       'owner' : IDL.Principal,
//       'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
//     }),
//     'timestamp' : IDL.Int,
//     'amount' : IDL.Nat,
//   });
//   const Result = IDL.Variant({ 'ok' : Order, 'err' : IDL.Text });
//   const Subaccount = IDL.Vec(IDL.Nat8);
//   return IDL.Service({
//     'checkPaymentStatus' : IDL.Func([IDL.Nat32], [Result], []),
//     'createOrder' : IDL.Func([IDL.Nat], [Result], []),
//     'getCanisterPrincipal' : IDL.Func([], [IDL.Principal], ['query']),
//     'toSubaccount' : IDL.Func([IDL.Principal], [Subaccount], []),
//     'whoami' : IDL.Func([], [IDL.Text], []),
//   });
// };
// export const init = ({ IDL }) => { return []; };
export const idlFactoryB = ({ IDL }) => {
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const TokenType = IDL.Variant({
    ICP: IDL.Null,
    ckBTC: IDL.Null,
    ckETH: IDL.Null,
    GLDGov: IDL.Null,
    ckUSDC: IDL.Null,
  });
  const TransferStatus = IDL.Record({
    status: IDL.Variant({
      Failed: IDL.Null,
      Completed: IDL.Null,
      Pending: IDL.Null,
    }),
    feeAmount: IDL.Nat,
    version: IDL.Nat,
    blockIndex: IDL.Opt(IDL.Nat),
    timestamp: IDL.Int,
    payment_gateway: IDL.Text,
    index_id: IDL.Nat,
    toAccount: Account,
    amount: IDL.Nat,
    token_type: TokenType,
    merchant_name: IDL.Text,
  });
  const Result = IDL.Variant({ ok: IDL.Null, err: IDL.Text });
  const TransferArgs = IDL.Record({
    order_id: IDL.Nat32,
    toAccount: Account,
    amount: IDL.Nat,
    token_type: TokenType,
    merchant_name: IDL.Text,
  });
  const Result_1 = IDL.Variant({ ok: IDL.Nat, err: IDL.Text });
  return IDL.Service({
    getAllTransfers: IDL.Func([], [IDL.Vec(TransferStatus)], ["query"]),
    getCurrentFeeAddress: IDL.Func([], [Account], ["query"]),
    getCurrentFeePercentage: IDL.Func([], [IDL.Float64], ["query"]),
    getTransferStatus: IDL.Func(
      [IDL.Nat32],
      [IDL.Opt(TransferStatus)],
      ["query"]
    ),
    getTransfers: IDL.Func(
      [IDL.Nat, IDL.Nat],
      [IDL.Vec(TransferStatus)],
      ["query"]
    ),
    getVersion: IDL.Func([], [IDL.Nat], ["query"]),
    isOrderCompleted: IDL.Func([IDL.Nat32], [IDL.Bool], ["query"]),
    setFeeAddress: IDL.Func([Account], [Result], []),
    setFeePercentage: IDL.Func([IDL.Float64], [Result], []),
    transfer: IDL.Func([TransferArgs], [Result_1], []),
    transferOwnership: IDL.Func([IDL.Principal], [Result], []),
  });
};
export const init = ({ IDL }) => {
  return [];
};
