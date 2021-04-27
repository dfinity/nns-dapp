export default ({ IDL }) => {
  const AccountIdentifier = IDL.Text;
  const SubAccount = IDL.Vec(IDL.Nat8);
  const SubAccountDetails = IDL.Record({
    'name' : IDL.Text,
    'sub_account' : SubAccount,
    'account_identifier' : AccountIdentifier,
  });
  const CreateSubAccountResponse = IDL.Variant({
    'Ok' : SubAccountDetails,
    'AccountNotFound' : IDL.Null,
    'SubAccountLimitExceeded' : IDL.Null,
  });
  const HardwareWalletAccountDetails = IDL.Record({
    'name' : IDL.Text,
    'account_identifier' : AccountIdentifier,
  });
  const AccountDetails = IDL.Record({
    'account_identifier' : AccountIdentifier,
    'hardware_wallet_accounts' : IDL.Vec(HardwareWalletAccountDetails),
    'sub_accounts' : IDL.Vec(SubAccountDetails),
  });
  const GetAccountResponse = IDL.Variant({
    'Ok' : AccountDetails,
    'AccountNotFound' : IDL.Null,
  });
  const GetTransactionsRequest = IDL.Record({
    'page_size' : IDL.Nat8,
    'offset' : IDL.Nat32,
    'account_identifier' : AccountIdentifier,
  });
  const Timestamp = IDL.Record({ 'timestamp_nanos' : IDL.Nat64 });
  const BlockHeight = IDL.Nat64;
  const ICPTs = IDL.Record({ 'e8s' : IDL.Nat64 });
  const Send = IDL.Record({
    'to' : AccountIdentifier,
    'fee' : ICPTs,
    'amount' : ICPTs,
  });
  const Receive = IDL.Record({
    'fee' : ICPTs,
    'from' : AccountIdentifier,
    'amount' : ICPTs,
  });
  const Transfer = IDL.Variant({
    'Burn' : IDL.Record({ 'amount' : ICPTs }),
    'Mint' : IDL.Record({ 'amount' : ICPTs }),
    'Send' : Send,
    'Receive' : Receive,
  });
  const Transaction = IDL.Record({
    'timestamp' : Timestamp,
    'block_height' : BlockHeight,
    'transfer' : Transfer,
  });
  const GetTransactionsResponse = IDL.Record({
    'total' : IDL.Nat32,
    'transactions' : IDL.Vec(Transaction),
  });
  const RegisterHardwareWalletRequest = IDL.Record({
    'name' : IDL.Text,
    'account_identifier' : AccountIdentifier,
  });
  const RegisterHardwareWalletResponse = IDL.Variant({
    'Ok' : IDL.Null,
    'AccountNotFound' : IDL.Null,
    'HardwareWalletLimitExceeded' : IDL.Null,
  });
  return IDL.Service({
    'add_account' : IDL.Func([], [AccountIdentifier], []),
    'create_sub_account' : IDL.Func([IDL.Text], [CreateSubAccountResponse], []),
    'get_account' : IDL.Func([], [GetAccountResponse], ['query']),
    'get_transactions' : IDL.Func(
        [GetTransactionsRequest],
        [GetTransactionsResponse],
        ['query'],
    ),
    'register_hardware_wallet' : IDL.Func(
        [RegisterHardwareWalletRequest],
        [RegisterHardwareWalletResponse],
        [],
    ),
    'sync_transactions' : IDL.Func([], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
