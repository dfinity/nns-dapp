export default ({ IDL }) => {
  const AccountIdentifier = IDL.Text;
  const SubAccount = IDL.Vec(IDL.Nat8);
  const NamedSubAccount = IDL.Record({
    'name' : IDL.Text,
    'sub_account' : SubAccount,
    'account_identifier' : AccountIdentifier,
  });
  const CreateSubAccountResponse = IDL.Variant({
    'Ok' : NamedSubAccount,
    'AccountNotFound' : IDL.Null,
    'SubAccountLimitExceeded' : IDL.Null,
  });
  const GetAccountResponse = IDL.Variant({
    'Ok' : IDL.Record({
      'account_identifier' : AccountIdentifier,
      'sub_accounts' : IDL.Vec(NamedSubAccount),
    }),
    'AccountNotFound' : IDL.Null,
  });
  const GetTransactionsRequest = IDL.Record({
    'page_size' : IDL.Nat8,
    'offset' : IDL.Nat32,
    'account_identifier' : AccountIdentifier,
  });
  const Timestamp = IDL.Record({ 'secs' : IDL.Nat64, 'nanos' : IDL.Nat32 });
  const BlockHeight = IDL.Nat64;
  const Doms = IDL.Nat64;
  const Send = IDL.Record({
    'to' : AccountIdentifier,
    'fee' : Doms,
    'amount' : Doms,
  });
  const Receive = IDL.Record({
    'fee' : Doms,
    'from' : AccountIdentifier,
    'amount' : Doms,
  });
  const Transfer = IDL.Variant({
    'Burn' : IDL.Record({ 'amount' : Doms }),
    'Mint' : IDL.Record({ 'amount' : Doms }),
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
  return IDL.Service({
    'add_account' : IDL.Func([], [AccountIdentifier], []),
    'create_sub_account' : IDL.Func([IDL.Text], [CreateSubAccountResponse], []),
    'get_account' : IDL.Func([], [GetAccountResponse], ['query']),
    'get_transactions' : IDL.Func(
        [GetTransactionsRequest],
        [GetTransactionsResponse],
        ['query'],
    ),
  });
};
export const init = ({ IDL }) => { return []; };
