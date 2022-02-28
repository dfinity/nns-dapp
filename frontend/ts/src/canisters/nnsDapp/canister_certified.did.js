/**
 * The candid to interact with the NNS dapp using update calls for additional security.
 */


export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Text;
  const SubAccount = IDL.Vec(IDL.Nat8);
  const SubAccountDetails = IDL.Record({
    'name' : IDL.Text,
    'sub_account' : SubAccount,
    'account_identifier' : AccountIdentifier,
  });
  const HardwareWalletAccountDetails = IDL.Record({
    'principal' : IDL.Principal,
    'name' : IDL.Text,
    'account_identifier' : AccountIdentifier,
  });
  const AccountDetails = IDL.Record({
    'principal' : IDL.Principal,
    'account_identifier' : AccountIdentifier,
    'hardware_wallet_accounts' : IDL.Vec(HardwareWalletAccountDetails),
    'sub_accounts' : IDL.Vec(SubAccountDetails),
  });
  const GetAccountResponse = IDL.Variant({
    'Ok' : AccountDetails,
    'AccountNotFound' : IDL.Null,
  });
  const CanisterDetails = IDL.Record({
    'name' : IDL.Text,
    'canister_id' : IDL.Principal,
  });
  const BlockHeight = IDL.Nat64;
  const CanisterId = IDL.Principal;
  const GetTransactionsRequest = IDL.Record({
    'page_size' : IDL.Nat8,
    'offset' : IDL.Nat32,
    'account_identifier' : AccountIdentifier,
  });
  const TransactionType = IDL.Variant({
    'Burn' : IDL.Null,
    'Mint' : IDL.Null,
    'Transfer' : IDL.Null,
    'StakeNeuronNotification' : IDL.Null,
    'TopUpCanister' : CanisterId,
    'CreateCanister' : IDL.Null,
    'TopUpNeuron' : IDL.Null,
    'StakeNeuron' : IDL.Null,
  });
  const Timestamp = IDL.Record({ 'timestamp_nanos' : IDL.Nat64 });
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
    'transaction_type' : IDL.Opt(TransactionType),
    'memo' : IDL.Nat64,
    'timestamp' : Timestamp,
    'block_height' : BlockHeight,
    'transfer' : Transfer,
  });
  const GetTransactionsResponse = IDL.Record({
    'total' : IDL.Nat32,
    'transactions' : IDL.Vec(Transaction),
  });

  return IDL.Service({
    'get_account' : IDL.Func([], [GetAccountResponse]),
    'get_canisters' : IDL.Func([], [IDL.Vec(CanisterDetails)]),
    'get_transactions' : IDL.Func(
        [GetTransactionsRequest],
        [GetTransactionsResponse],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
