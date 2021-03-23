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
  const NotifyCanisterArgs = IDL.Record({
    'to_subaccount' : IDL.Opt(SubAccount),
    'from_subaccount' : IDL.Opt(SubAccount),
    'to_canister' : IDL.Principal,
    'max_fee' : ICPTs,
    'block_height' : BlockHeight,
  });
  const Memo = IDL.Nat64;
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
    'block' : IDL.Func([BlockHeight], [IDL.Opt(IDL.Vec(IDL.Nat8))], ['query']),
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
