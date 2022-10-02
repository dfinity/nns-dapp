/* Do not edit.  Compiled with ./scripts/compile-idl-js from src/lib/canisters/nns-dapp/nns-dapp.did */
export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Text;
  const SubAccount = IDL.Vec(IDL.Nat8);
  const AddPendingNotifySwapRequest = IDL.Record({
    swap_canister_id: IDL.Principal,
    buyer_sub_account: IDL.Opt(SubAccount),
    buyer: IDL.Principal,
  });
  const AddPendingTransactionResponse = IDL.Variant({
    Ok: IDL.Null,
    NotAuthorized: IDL.Null,
  });
  const AttachCanisterRequest = IDL.Record({
    name: IDL.Text,
    canister_id: IDL.Principal,
  });
  const AttachCanisterResponse = IDL.Variant({
    Ok: IDL.Null,
    CanisterAlreadyAttached: IDL.Null,
    NameAlreadyTaken: IDL.Null,
    NameTooLong: IDL.Null,
    CanisterLimitExceeded: IDL.Null,
  });
  const SubAccountDetails = IDL.Record({
    name: IDL.Text,
    sub_account: SubAccount,
    account_identifier: AccountIdentifier,
  });
  const CreateSubAccountResponse = IDL.Variant({
    Ok: SubAccountDetails,
    AccountNotFound: IDL.Null,
    NameTooLong: IDL.Null,
    SubAccountLimitExceeded: IDL.Null,
  });
  const DetachCanisterRequest = IDL.Record({ canister_id: IDL.Principal });
  const DetachCanisterResponse = IDL.Variant({
    Ok: IDL.Null,
    CanisterNotFound: IDL.Null,
  });
  const HardwareWalletAccountDetails = IDL.Record({
    principal: IDL.Principal,
    name: IDL.Text,
    account_identifier: AccountIdentifier,
  });
  const AccountDetails = IDL.Record({
    principal: IDL.Principal,
    account_identifier: AccountIdentifier,
    hardware_wallet_accounts: IDL.Vec(HardwareWalletAccountDetails),
    sub_accounts: IDL.Vec(SubAccountDetails),
  });
  const GetAccountResponse = IDL.Variant({
    Ok: AccountDetails,
    AccountNotFound: IDL.Null,
  });
  const CanisterDetails = IDL.Record({
    name: IDL.Text,
    canister_id: IDL.Principal,
  });
  const BlockHeight = IDL.Nat64;
  const MultiPartTransactionError = IDL.Record({
    error_message: IDL.Text,
    block_height: BlockHeight,
  });
  const CanisterId = IDL.Principal;
  const NeuronId = IDL.Nat64;
  const MultiPartTransactionStatus = IDL.Variant({
    Queued: IDL.Null,
    Error: IDL.Text,
    Refunded: IDL.Tuple(BlockHeight, IDL.Text),
    CanisterCreated: CanisterId,
    Complete: IDL.Null,
    NotFound: IDL.Null,
    NeuronCreated: NeuronId,
    PendingSync: IDL.Null,
    ErrorWithRefundPending: IDL.Text,
  });
  const GetProposalPayloadResponse = IDL.Variant({
    Ok: IDL.Text,
    Err: IDL.Text,
  });
  const Stats = IDL.Record({
    latest_transaction_block_height: BlockHeight,
    seconds_since_last_ledger_sync: IDL.Nat64,
    sub_accounts_count: IDL.Nat64,
    neurons_topped_up_count: IDL.Nat64,
    transactions_to_process_queue_length: IDL.Nat32,
    neurons_created_count: IDL.Nat64,
    hardware_wallet_accounts_count: IDL.Nat64,
    accounts_count: IDL.Nat64,
    earliest_transaction_block_height: BlockHeight,
    transactions_count: IDL.Nat64,
    block_height_synced_up_to: IDL.Opt(IDL.Nat64),
    latest_transaction_timestamp_nanos: IDL.Nat64,
    earliest_transaction_timestamp_nanos: IDL.Nat64,
  });
  const GetTransactionsRequest = IDL.Record({
    page_size: IDL.Nat8,
    offset: IDL.Nat32,
    account_identifier: AccountIdentifier,
  });
  const TransactionType = IDL.Variant({
    Burn: IDL.Null,
    Mint: IDL.Null,
    StakeNeuronNotification: IDL.Null,
    TopUpCanister: CanisterId,
    ParticipateSwap: CanisterId,
    CreateCanister: IDL.Null,
    Transfer: IDL.Null,
    TopUpNeuron: IDL.Null,
    StakeNeuron: IDL.Null,
  });
  const Timestamp = IDL.Record({ timestamp_nanos: IDL.Nat64 });
  const ICPTs = IDL.Record({ e8s: IDL.Nat64 });
  const Send = IDL.Record({
    to: AccountIdentifier,
    fee: ICPTs,
    amount: ICPTs,
  });
  const Receive = IDL.Record({
    fee: ICPTs,
    from: AccountIdentifier,
    amount: ICPTs,
  });
  const Transfer = IDL.Variant({
    Burn: IDL.Record({ amount: ICPTs }),
    Mint: IDL.Record({ amount: ICPTs }),
    Send: Send,
    Receive: Receive,
  });
  const Transaction = IDL.Record({
    transaction_type: IDL.Opt(TransactionType),
    memo: IDL.Nat64,
    timestamp: Timestamp,
    block_height: BlockHeight,
    transfer: Transfer,
  });
  const GetTransactionsResponse = IDL.Record({
    total: IDL.Nat32,
    transactions: IDL.Vec(Transaction),
  });
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpRequest = IDL.Record({
    url: IDL.Text,
    method: IDL.Text,
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(HeaderField),
  });
  const HttpResponse = IDL.Record({
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(HeaderField),
    status_code: IDL.Nat16,
  });
  const RegisterHardwareWalletRequest = IDL.Record({
    principal: IDL.Principal,
    name: IDL.Text,
  });
  const RegisterHardwareWalletResponse = IDL.Variant({
    Ok: IDL.Null,
    AccountNotFound: IDL.Null,
    HardwareWalletAlreadyRegistered: IDL.Null,
    HardwareWalletLimitExceeded: IDL.Null,
    NameTooLong: IDL.Null,
  });
  const RenameSubAccountRequest = IDL.Record({
    new_name: IDL.Text,
    account_identifier: AccountIdentifier,
  });
  const RenameSubAccountResponse = IDL.Variant({
    Ok: IDL.Null,
    AccountNotFound: IDL.Null,
    SubAccountNotFound: IDL.Null,
    NameTooLong: IDL.Null,
  });
  return IDL.Service({
    add_account: IDL.Func([], [AccountIdentifier], []),
    add_pending_notify_swap: IDL.Func(
      [AddPendingNotifySwapRequest],
      [AddPendingTransactionResponse],
      []
    ),
    add_stable_asset: IDL.Func([IDL.Vec(IDL.Nat8)], [], []),
    attach_canister: IDL.Func(
      [AttachCanisterRequest],
      [AttachCanisterResponse],
      []
    ),
    create_sub_account: IDL.Func([IDL.Text], [CreateSubAccountResponse], []),
    detach_canister: IDL.Func(
      [DetachCanisterRequest],
      [DetachCanisterResponse],
      []
    ),
    get_account: IDL.Func([], [GetAccountResponse], ["query"]),
    get_canisters: IDL.Func([], [IDL.Vec(CanisterDetails)], ["query"]),
    get_multi_part_transaction_errors: IDL.Func(
      [],
      [IDL.Vec(MultiPartTransactionError)],
      ["query"]
    ),
    get_multi_part_transaction_status: IDL.Func(
      [IDL.Principal, BlockHeight],
      [MultiPartTransactionStatus],
      ["query"]
    ),
    get_proposal_payload: IDL.Func(
      [IDL.Nat64],
      [GetProposalPayloadResponse],
      []
    ),
    get_stats: IDL.Func([], [Stats], ["query"]),
    get_transactions: IDL.Func(
      [GetTransactionsRequest],
      [GetTransactionsResponse],
      ["query"]
    ),
    http_request: IDL.Func([HttpRequest], [HttpResponse], ["query"]),
    register_hardware_wallet: IDL.Func(
      [RegisterHardwareWalletRequest],
      [RegisterHardwareWalletResponse],
      []
    ),
    rename_sub_account: IDL.Func(
      [RenameSubAccountRequest],
      [RenameSubAccountResponse],
      []
    ),
  });
};
// Remove param `{ IDL }` because TS was complaining of unused variable
export const init = () => {
  return [];
};
