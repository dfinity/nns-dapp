export default ({ IDL }) => {
  const SubAccount = IDL.Vec(IDL.Nat8);
  const ICPTs = IDL.Record({ 'doms' : IDL.Nat64 });
  const LedgerCanisterInitPayload = IDL.Record({
    'minting_account' : IDL.Principal,
    'max_message_size_bytes' : IDL.Opt(IDL.Nat32),
    'archive_canister' : IDL.Opt(IDL.Principal),
    'initial_values' : IDL.Vec(
      IDL.Tuple(IDL.Principal, IDL.Vec(IDL.Tuple(IDL.Opt(SubAccount), ICPTs)))
    ),
  });
  const AccountBalanceArgs = IDL.Record({
    'sub_account' : IDL.Opt(SubAccount),
    'account' : IDL.Principal,
  });
  const BlockHeight = IDL.Nat64;
  const Memo = IDL.Nat64;
  const Transfer = IDL.Variant({
    'Burn' : IDL.Record({ 'from' : IDL.Principal, 'amount' : ICPTs }),
    'Mint' : IDL.Record({ 'to' : IDL.Principal, 'amount' : ICPTs }),
    'Send' : IDL.Record({
      'to' : IDL.Principal,
      'from' : IDL.Principal,
      'amount' : ICPTs,
    }),
  });
  const Transaction = IDL.Record({
    'memo' : Memo,
    'created_at' : BlockHeight,
    'transfer' : Transfer,
  });
  const SystemTime = IDL.Nat64;
  const Block = IDL.Record({
    'transaction' : Transaction,
    'timestamp' : SystemTime,
  });
  const NotifyCanisterArgs = IDL.Record({
    'to_subaccount' : IDL.Opt(SubAccount),
    'from_subaccount' : IDL.Opt(SubAccount),
    'to_canister' : IDL.Principal,
    'max_fee' : ICPTs,
    'block_height' : BlockHeight,
  });
  const SendArgs = IDL.Record({
    'to' : IDL.Principal,
    'fee' : ICPTs,
    'to_subaccount' : IDL.Opt(SubAccount),
    'memo' : Memo,
    'from_subaccount' : IDL.Opt(SubAccount),
    'amount' : ICPTs,
    'block_height' : IDL.Opt(BlockHeight),
  });
  const TotalSupplyArgs = IDL.Record({});
  const Certification = IDL.Opt(IDL.Vec(IDL.Nat8));
  return IDL.Service({
    'account_balance' : IDL.Func([AccountBalanceArgs], [ICPTs], ['query']),
    'block' : IDL.Func([BlockHeight], [IDL.Opt(Block)], ['query']),
    'notify' : IDL.Func([NotifyCanisterArgs], [], []),
    'send' : IDL.Func([SendArgs], [IDL.Nat64], []),
    'supply' : IDL.Func([TotalSupplyArgs], [ICPTs], ['query']),
    'tip_of_chain' : IDL.Func([], [Certification, BlockHeight], ['query']),
  });
};
export const init = ({ IDL }) => {
  const SubAccount = IDL.Vec(IDL.Nat8);
  const ICPTs = IDL.Record({ 'doms' : IDL.Nat64 });
  const LedgerCanisterInitPayload = IDL.Record({
    'minting_account' : IDL.Principal,
    'max_message_size_bytes' : IDL.Opt(IDL.Nat32),
    'archive_canister' : IDL.Opt(IDL.Principal),
    'initial_values' : IDL.Vec(
      IDL.Tuple(IDL.Principal, IDL.Vec(IDL.Tuple(IDL.Opt(SubAccount), ICPTs)))
    ),
  });
  return [LedgerCanisterInitPayload];
};
