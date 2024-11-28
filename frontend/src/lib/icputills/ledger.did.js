export const idlFactory = ({ IDL }) => {
  const Value = IDL.Rec();
  const Vec = IDL.Rec();
  const MetadataValue = IDL.Variant({
    Int: IDL.Int,
    Nat: IDL.Nat,
    Blob: IDL.Vec(IDL.Nat8),
    Text: IDL.Text,
  });
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const ChangeFeeCollector = IDL.Variant({
    SetTo: Account,
    Unset: IDL.Null,
  });
  const FeatureFlags = IDL.Record({ icrc2: IDL.Bool });
  const UpgradeArgs = IDL.Record({
    token_symbol: IDL.Opt(IDL.Text),
    transfer_fee: IDL.Opt(IDL.Nat),
    metadata: IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, MetadataValue))),
    maximum_number_of_accounts: IDL.Opt(IDL.Nat64),
    accounts_overflow_trim_quantity: IDL.Opt(IDL.Nat64),
    change_fee_collector: IDL.Opt(ChangeFeeCollector),
    max_memo_length: IDL.Opt(IDL.Nat16),
    token_name: IDL.Opt(IDL.Text),
    feature_flags: IDL.Opt(FeatureFlags),
  });
  const ArchiveOptions = IDL.Record({
    num_blocks_to_archive: IDL.Nat64,
    max_transactions_per_response: IDL.Opt(IDL.Nat64),
    trigger_threshold: IDL.Nat64,
    max_message_size_bytes: IDL.Opt(IDL.Nat64),
    cycles_for_archive_creation: IDL.Opt(IDL.Nat64),
    node_max_memory_size_bytes: IDL.Opt(IDL.Nat64),
    controller_id: IDL.Principal,
  });
  const InitArgs = IDL.Record({
    decimals: IDL.Opt(IDL.Nat8),
    token_symbol: IDL.Text,
    transfer_fee: IDL.Nat,
    metadata: IDL.Vec(IDL.Tuple(IDL.Text, MetadataValue)),
    minting_account: Account,
    initial_balances: IDL.Vec(IDL.Tuple(Account, IDL.Nat)),
    maximum_number_of_accounts: IDL.Opt(IDL.Nat64),
    accounts_overflow_trim_quantity: IDL.Opt(IDL.Nat64),
    fee_collector_account: IDL.Opt(Account),
    archive_options: ArchiveOptions,
    max_memo_length: IDL.Opt(IDL.Nat16),
    token_name: IDL.Text,
    feature_flags: IDL.Opt(FeatureFlags),
  });
  const LedgerArgument = IDL.Variant({
    Upgrade: IDL.Opt(UpgradeArgs),
    Init: InitArgs,
  });
  const GetBlocksRequest = IDL.Record({
    start: IDL.Nat,
    length: IDL.Nat,
  });
  Vec.fill(
    IDL.Vec(
      IDL.Variant({
        Int: IDL.Int,
        Map: IDL.Vec(IDL.Tuple(IDL.Text, Value)),
        Nat: IDL.Nat,
        Nat64: IDL.Nat64,
        Blob: IDL.Vec(IDL.Nat8),
        Text: IDL.Text,
        Array: Vec,
      })
    )
  );
  Value.fill(
    IDL.Variant({
      Int: IDL.Int,
      Map: IDL.Vec(IDL.Tuple(IDL.Text, Value)),
      Nat: IDL.Nat,
      Nat64: IDL.Nat64,
      Blob: IDL.Vec(IDL.Nat8),
      Text: IDL.Text,
      Array: Vec,
    })
  );
  const BlockRange = IDL.Record({ blocks: IDL.Vec(Value) });
  const ArchivedRange = IDL.Record({
    callback: IDL.Func([GetBlocksRequest], [BlockRange], ["query"]),
    start: IDL.Nat,
    length: IDL.Nat,
  });
  const GetBlocksResponse = IDL.Record({
    certificate: IDL.Opt(IDL.Vec(IDL.Nat8)),
    first_index: IDL.Nat,
    blocks: IDL.Vec(Value),
    chain_length: IDL.Nat64,
    archived_blocks: IDL.Vec(ArchivedRange),
  });
  const DataCertificate = IDL.Record({
    certificate: IDL.Opt(IDL.Vec(IDL.Nat8)),
    hash_tree: IDL.Vec(IDL.Nat8),
  });
  const Burn = IDL.Record({
    from: Account,
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    created_at_time: IDL.Opt(IDL.Nat64),
    amount: IDL.Nat,
    spender: IDL.Opt(Account),
  });
  const Mint = IDL.Record({
    to: Account,
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    created_at_time: IDL.Opt(IDL.Nat64),
    amount: IDL.Nat,
  });
  const Approve = IDL.Record({
    fee: IDL.Opt(IDL.Nat),
    from: Account,
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    created_at_time: IDL.Opt(IDL.Nat64),
    amount: IDL.Nat,
    expected_allowance: IDL.Opt(IDL.Nat),
    expires_at: IDL.Opt(IDL.Nat64),
    spender: Account,
  });
  const Transfer = IDL.Record({
    to: Account,
    fee: IDL.Opt(IDL.Nat),
    from: Account,
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    created_at_time: IDL.Opt(IDL.Nat64),
    amount: IDL.Nat,
    spender: IDL.Opt(Account),
  });
  const Transaction = IDL.Record({
    burn: IDL.Opt(Burn),
    kind: IDL.Text,
    mint: IDL.Opt(Mint),
    approve: IDL.Opt(Approve),
    timestamp: IDL.Nat64,
    transfer: IDL.Opt(Transfer),
  });
  const TransactionRange = IDL.Record({
    transactions: IDL.Vec(Transaction),
  });
  const ArchivedRange_1 = IDL.Record({
    callback: IDL.Func([GetBlocksRequest], [TransactionRange], ["query"]),
    start: IDL.Nat,
    length: IDL.Nat,
  });
  const GetTransactionsResponse = IDL.Record({
    first_index: IDL.Nat,
    log_length: IDL.Nat,
    transactions: IDL.Vec(Transaction),
    archived_transactions: IDL.Vec(ArchivedRange_1),
  });
  const StandardRecord = IDL.Record({ url: IDL.Text, name: IDL.Text });
  const TransferArg = IDL.Record({
    to: Account,
    fee: IDL.Opt(IDL.Nat),
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
    created_at_time: IDL.Opt(IDL.Nat64),
    amount: IDL.Nat,
  });
  const TransferError = IDL.Variant({
    GenericError: IDL.Record({
      message: IDL.Text,
      error_code: IDL.Nat,
    }),
    TemporarilyUnavailable: IDL.Null,
    BadBurn: IDL.Record({ min_burn_amount: IDL.Nat }),
    Duplicate: IDL.Record({ duplicate_of: IDL.Nat }),
    BadFee: IDL.Record({ expected_fee: IDL.Nat }),
    CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
    TooOld: IDL.Null,
    InsufficientFunds: IDL.Record({ balance: IDL.Nat }),
  });
  const Result = IDL.Variant({ Ok: IDL.Nat, Err: TransferError });
  const AllowanceArgs = IDL.Record({
    account: Account,
    spender: Account,
  });
  const Allowance = IDL.Record({
    allowance: IDL.Nat,
    expires_at: IDL.Opt(IDL.Nat64),
  });
  const ApproveArgs = IDL.Record({
    fee: IDL.Opt(IDL.Nat),
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
    created_at_time: IDL.Opt(IDL.Nat64),
    amount: IDL.Nat,
    expected_allowance: IDL.Opt(IDL.Nat),
    expires_at: IDL.Opt(IDL.Nat64),
    spender: Account,
  });
  const ApproveError = IDL.Variant({
    GenericError: IDL.Record({
      message: IDL.Text,
      error_code: IDL.Nat,
    }),
    TemporarilyUnavailable: IDL.Null,
    Duplicate: IDL.Record({ duplicate_of: IDL.Nat }),
    BadFee: IDL.Record({ expected_fee: IDL.Nat }),
    AllowanceChanged: IDL.Record({ current_allowance: IDL.Nat }),
    CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
    TooOld: IDL.Null,
    Expired: IDL.Record({ ledger_time: IDL.Nat64 }),
    InsufficientFunds: IDL.Record({ balance: IDL.Nat }),
  });
  const Result_1 = IDL.Variant({ Ok: IDL.Nat, Err: ApproveError });
  const TransferFromArgs = IDL.Record({
    to: Account,
    fee: IDL.Opt(IDL.Nat),
    spender_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
    from: Account,
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    created_at_time: IDL.Opt(IDL.Nat64),
    amount: IDL.Nat,
  });
  const TransferFromError = IDL.Variant({
    GenericError: IDL.Record({
      message: IDL.Text,
      error_code: IDL.Nat,
    }),
    TemporarilyUnavailable: IDL.Null,
    InsufficientAllowance: IDL.Record({ allowance: IDL.Nat }),
    BadBurn: IDL.Record({ min_burn_amount: IDL.Nat }),
    Duplicate: IDL.Record({ duplicate_of: IDL.Nat }),
    BadFee: IDL.Record({ expected_fee: IDL.Nat }),
    CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
    TooOld: IDL.Null,
    InsufficientFunds: IDL.Record({ balance: IDL.Nat }),
  });
  const Result_2 = IDL.Variant({ Ok: IDL.Nat, Err: TransferFromError });
  return IDL.Service({
    get_blocks: IDL.Func([GetBlocksRequest], [GetBlocksResponse], ["query"]),
    get_data_certificate: IDL.Func([], [DataCertificate], ["query"]),
    get_transactions: IDL.Func(
      [GetBlocksRequest],
      [GetTransactionsResponse],
      ["query"]
    ),
    icrc1_balance_of: IDL.Func([Account], [IDL.Nat], ["query"]),
    icrc1_decimals: IDL.Func([], [IDL.Nat8], ["query"]),
    icrc1_fee: IDL.Func([], [IDL.Nat], ["query"]),
    icrc1_metadata: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Text, MetadataValue))],
      ["query"]
    ),
    icrc1_minting_account: IDL.Func([], [IDL.Opt(Account)], ["query"]),
    icrc1_name: IDL.Func([], [IDL.Text], ["query"]),
    icrc1_supported_standards: IDL.Func(
      [],
      [IDL.Vec(StandardRecord)],
      ["query"]
    ),
    icrc1_symbol: IDL.Func([], [IDL.Text], ["query"]),
    icrc1_total_supply: IDL.Func([], [IDL.Nat], ["query"]),
    icrc1_transfer: IDL.Func([TransferArg], [Result], []),
    icrc2_allowance: IDL.Func([AllowanceArgs], [Allowance], ["query"]),
    icrc2_approve: IDL.Func([ApproveArgs], [Result_1], []),
    icrc2_transfer_from: IDL.Func([TransferFromArgs], [Result_2], []),
  });
};
export const init = ({ IDL }) => {
  const MetadataValue = IDL.Variant({
    Int: IDL.Int,
    Nat: IDL.Nat,
    Blob: IDL.Vec(IDL.Nat8),
    Text: IDL.Text,
  });
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const ChangeFeeCollector = IDL.Variant({
    SetTo: Account,
    Unset: IDL.Null,
  });
  const FeatureFlags = IDL.Record({ icrc2: IDL.Bool });
  const UpgradeArgs = IDL.Record({
    token_symbol: IDL.Opt(IDL.Text),
    transfer_fee: IDL.Opt(IDL.Nat),
    metadata: IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, MetadataValue))),
    maximum_number_of_accounts: IDL.Opt(IDL.Nat64),
    accounts_overflow_trim_quantity: IDL.Opt(IDL.Nat64),
    change_fee_collector: IDL.Opt(ChangeFeeCollector),
    max_memo_length: IDL.Opt(IDL.Nat16),
    token_name: IDL.Opt(IDL.Text),
    feature_flags: IDL.Opt(FeatureFlags),
  });
  const ArchiveOptions = IDL.Record({
    num_blocks_to_archive: IDL.Nat64,
    max_transactions_per_response: IDL.Opt(IDL.Nat64),
    trigger_threshold: IDL.Nat64,
    max_message_size_bytes: IDL.Opt(IDL.Nat64),
    cycles_for_archive_creation: IDL.Opt(IDL.Nat64),
    node_max_memory_size_bytes: IDL.Opt(IDL.Nat64),
    controller_id: IDL.Principal,
  });
  const InitArgs = IDL.Record({
    decimals: IDL.Opt(IDL.Nat8),
    token_symbol: IDL.Text,
    transfer_fee: IDL.Nat,
    metadata: IDL.Vec(IDL.Tuple(IDL.Text, MetadataValue)),
    minting_account: Account,
    initial_balances: IDL.Vec(IDL.Tuple(Account, IDL.Nat)),
    maximum_number_of_accounts: IDL.Opt(IDL.Nat64),
    accounts_overflow_trim_quantity: IDL.Opt(IDL.Nat64),
    fee_collector_account: IDL.Opt(Account),
    archive_options: ArchiveOptions,
    max_memo_length: IDL.Opt(IDL.Nat16),
    token_name: IDL.Text,
    feature_flags: IDL.Opt(FeatureFlags),
  });
  const LedgerArgument = IDL.Variant({
    Upgrade: IDL.Opt(UpgradeArgs),
    Init: InitArgs,
  });
  return [LedgerArgument];
};
