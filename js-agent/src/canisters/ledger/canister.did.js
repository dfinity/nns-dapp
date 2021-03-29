export default ({ IDL }) => {
  const AccountIdentifier = IDL.Text;
  const ICPTs = IDL.Record({ 'doms' : IDL.Nat64 });
  const LedgerCanisterInitPayload = IDL.Record({
    'minting_account' : AccountIdentifier,
    'max_message_size_bytes' : IDL.Opt(IDL.Nat32),
    'archive_canister' : IDL.Opt(IDL.Principal),
    'initial_values' : IDL.Vec(IDL.Tuple(AccountIdentifier, ICPTs)),
  });
  const AccountBalanceArgs = IDL.Record({ 'account' : AccountIdentifier });
  const BlockHeight = IDL.Nat64;
  const EncodedBlock = IDL.Vec(IDL.Nat8);
  const SubAccount = IDL.Vec(IDL.Nat8);
  const NotifyCanisterArgs = IDL.Record({
    'to_subaccount' : IDL.Opt(SubAccount),
    'from_subaccount' : IDL.Opt(SubAccount),
    'to_canister' : IDL.Principal,
    'max_fee' : ICPTs,
    'block_height' : BlockHeight,
  });
  const Memo = IDL.Nat64;
  const SendArgs = IDL.Record({
    'to' : AccountIdentifier,
    'fee' : ICPTs,
    'memo' : Memo,
    'from_subaccount' : IDL.Opt(SubAccount),
    'amount' : ICPTs,
    'block_height' : IDL.Opt(BlockHeight),
  });
  const Certification = IDL.Opt(IDL.Vec(IDL.Nat8));
  const TotalSupplyArgs = IDL.Record({});
  return IDL.Service({
    'account_balance' : IDL.Func([AccountBalanceArgs], [ICPTs], ['query']),
    'block' : IDL.Func([BlockHeight], [IDL.Opt(EncodedBlock)], ['query']),
    'notify' : IDL.Func([NotifyCanisterArgs], [], []),
    'send' : IDL.Func([SendArgs], [BlockHeight], []),
    'tip_of_chain' : IDL.Func([], [Certification, BlockHeight], ['query']),
    'total_supply' : IDL.Func([TotalSupplyArgs], [ICPTs], ['query']),
  });
};
export const init = ({ IDL }) => {
  const AccountIdentifier = IDL.Text;
  const ICPTs = IDL.Record({ 'doms' : IDL.Nat64 });
  const LedgerCanisterInitPayload = IDL.Record({
    'minting_account' : AccountIdentifier,
    'max_message_size_bytes' : IDL.Opt(IDL.Nat32),
    'archive_canister' : IDL.Opt(IDL.Principal),
    'initial_values' : IDL.Vec(IDL.Tuple(AccountIdentifier, ICPTs)),
  });
  return [LedgerCanisterInitPayload];
};
