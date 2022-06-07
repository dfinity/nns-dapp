export const idlFactory = ({ IDL }) => {
  const Proposal = IDL.Rec();
  const AccountIdentifierText = IDL.Text;
  const AttachCanisterRequest = IDL.Record({
    'name' : IDL.Text,
    'canister_id' : IDL.Principal,
  });
  const AttachCanisterResponse = IDL.Variant({
    'Ok' : IDL.Null,
    'CanisterAlreadyAttached' : IDL.Null,
    'NameAlreadyTaken' : IDL.Null,
    'NameTooLong' : IDL.Null,
    'CanisterLimitExceeded' : IDL.Null,
  });
  const SubAccount = IDL.Vec(IDL.Nat8);
  const SubAccountDetails = IDL.Record({
    'name' : IDL.Text,
    'sub_account' : SubAccount,
    'account_identifier' : AccountIdentifierText,
  });
  const CreateSubAccountResponse = IDL.Variant({
    'Ok' : SubAccountDetails,
    'AccountNotFound' : IDL.Null,
    'NameTooLong' : IDL.Null,
    'SubAccountLimitExceeded' : IDL.Null,
  });
  const DetachCanisterRequest = IDL.Record({ 'canister_id' : IDL.Principal });
  const DetachCanisterResponse = IDL.Variant({
    'Ok' : IDL.Null,
    'CanisterNotFound' : IDL.Null,
  });
  const HardwareWalletAccountDetails = IDL.Record({
    'principal' : IDL.Principal,
    'name' : IDL.Text,
    'account_identifier' : AccountIdentifierText,
  });
  const AccountDetails = IDL.Record({
    'principal' : IDL.Principal,
    'account_identifier' : AccountIdentifierText,
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
  const MultiPartTransactionError = IDL.Record({
    'error_message' : IDL.Text,
    'block_height' : BlockHeight,
  });
  const CanisterId = IDL.Principal;
  const MultiPartTransactionStatus = IDL.Variant({
    'Queued' : IDL.Null,
    'Error' : IDL.Text,
    'Refunded' : IDL.Tuple(BlockHeight, IDL.Text),
    'CanisterCreated' : CanisterId,
    'Complete' : IDL.Null,
    'NotFound' : IDL.Null,
    'NeuronCreated' : IDL.Nat64,
    'PendingSync' : IDL.Null,
    'ErrorWithRefundPending' : IDL.Text,
  });
  const NeuronId = IDL.Record({ 'id' : IDL.Nat64 });
  const GovernanceError = IDL.Record({
    'error_message' : IDL.Text,
    'error_type' : IDL.Int32,
  });
  const Ballot = IDL.Record({ 'vote' : IDL.Int32, 'voting_power' : IDL.Nat64 });
  const Tally = IDL.Record({
    'no' : IDL.Nat64,
    'yes' : IDL.Nat64,
    'total' : IDL.Nat64,
    'timestamp_seconds' : IDL.Nat64,
  });
  const KnownNeuronData = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Opt(IDL.Text),
  });
  const KnownNeuron = IDL.Record({
    'id' : IDL.Opt(NeuronId),
    'known_neuron_data' : IDL.Opt(KnownNeuronData),
  });
  const Spawn = IDL.Record({
    'percentage_to_spawn' : IDL.Opt(IDL.Nat32),
    'new_controller' : IDL.Opt(IDL.Principal),
    'nonce' : IDL.Opt(IDL.Nat64),
  });
  const Split = IDL.Record({ 'amount_e8s' : IDL.Nat64 });
  const Follow = IDL.Record({
    'topic' : IDL.Int32,
    'followees' : IDL.Vec(NeuronId),
  });
  const ClaimOrRefreshNeuronFromAccount = IDL.Record({
    'controller' : IDL.Opt(IDL.Principal),
    'memo' : IDL.Nat64,
  });
  const By = IDL.Variant({
    'NeuronIdOrSubaccount' : IDL.Record({}),
    'MemoAndController' : ClaimOrRefreshNeuronFromAccount,
    'Memo' : IDL.Nat64,
  });
  const ClaimOrRefresh = IDL.Record({ 'by' : IDL.Opt(By) });
  const RemoveHotKey = IDL.Record({
    'hot_key_to_remove' : IDL.Opt(IDL.Principal),
  });
  const AddHotKey = IDL.Record({ 'new_hot_key' : IDL.Opt(IDL.Principal) });
  const IncreaseDissolveDelay = IDL.Record({
    'additional_dissolve_delay_seconds' : IDL.Nat32,
  });
  const SetDissolveTimestamp = IDL.Record({
    'dissolve_timestamp_seconds' : IDL.Nat64,
  });
  const Operation = IDL.Variant({
    'RemoveHotKey' : RemoveHotKey,
    'AddHotKey' : AddHotKey,
    'StopDissolving' : IDL.Record({}),
    'StartDissolving' : IDL.Record({}),
    'IncreaseDissolveDelay' : IncreaseDissolveDelay,
    'JoinCommunityFund' : IDL.Record({}),
    'SetDissolveTimestamp' : SetDissolveTimestamp,
  });
  const Configure = IDL.Record({ 'operation' : IDL.Opt(Operation) });
  const RegisterVote = IDL.Record({
    'vote' : IDL.Int32,
    'proposal' : IDL.Opt(NeuronId),
  });
  const Merge = IDL.Record({ 'source_neuron_id' : IDL.Opt(NeuronId) });
  const DisburseToNeuron = IDL.Record({
    'dissolve_delay_seconds' : IDL.Nat64,
    'kyc_verified' : IDL.Bool,
    'amount_e8s' : IDL.Nat64,
    'new_controller' : IDL.Opt(IDL.Principal),
    'nonce' : IDL.Nat64,
  });
  const MergeMaturity = IDL.Record({ 'percentage_to_merge' : IDL.Nat32 });
  const AccountIdentifier = IDL.Record({ 'hash' : IDL.Vec(IDL.Nat8) });
  const Amount = IDL.Record({ 'e8s' : IDL.Nat64 });
  const Disburse = IDL.Record({
    'to_account' : IDL.Opt(AccountIdentifier),
    'amount' : IDL.Opt(Amount),
  });
  const Command = IDL.Variant({
    'Spawn' : Spawn,
    'Split' : Split,
    'Follow' : Follow,
    'ClaimOrRefresh' : ClaimOrRefresh,
    'Configure' : Configure,
    'RegisterVote' : RegisterVote,
    'Merge' : Merge,
    'DisburseToNeuron' : DisburseToNeuron,
    'MakeProposal' : Proposal,
    'MergeMaturity' : MergeMaturity,
    'Disburse' : Disburse,
  });
  const NeuronIdOrSubaccount = IDL.Variant({
    'Subaccount' : IDL.Vec(IDL.Nat8),
    'NeuronId' : NeuronId,
  });
  const ManageNeuron = IDL.Record({
    'id' : IDL.Opt(NeuronId),
    'command' : IDL.Opt(Command),
    'neuron_id_or_subaccount' : IDL.Opt(NeuronIdOrSubaccount),
  });
  const ExecuteNnsFunction = IDL.Record({
    'nns_function' : IDL.Int32,
    'payload' : IDL.Vec(IDL.Nat8),
  });
  const NodeProvider = IDL.Record({
    'id' : IDL.Opt(IDL.Principal),
    'reward_account' : IDL.Opt(AccountIdentifier),
  });
  const RewardToNeuron = IDL.Record({ 'dissolve_delay_seconds' : IDL.Nat64 });
  const RewardToAccount = IDL.Record({
    'to_account' : IDL.Opt(AccountIdentifier),
  });
  const RewardMode = IDL.Variant({
    'RewardToNeuron' : RewardToNeuron,
    'RewardToAccount' : RewardToAccount,
  });
  const RewardNodeProvider = IDL.Record({
    'node_provider' : IDL.Opt(NodeProvider),
    'reward_mode' : IDL.Opt(RewardMode),
    'amount_e8s' : IDL.Nat64,
  });
  const Followees = IDL.Record({ 'followees' : IDL.Vec(NeuronId) });
  const SetDefaultFollowees = IDL.Record({
    'default_followees' : IDL.Vec(IDL.Tuple(IDL.Int32, Followees)),
  });
  const RewardNodeProviders = IDL.Record({
    'use_registry_derived_rewards' : IDL.Opt(IDL.Bool),
    'rewards' : IDL.Vec(RewardNodeProvider),
  });
  const NetworkEconomics = IDL.Record({
    'neuron_minimum_stake_e8s' : IDL.Nat64,
    'max_proposals_to_keep_per_topic' : IDL.Nat32,
    'neuron_management_fee_per_proposal_e8s' : IDL.Nat64,
    'reject_cost_e8s' : IDL.Nat64,
    'transaction_fee_e8s' : IDL.Nat64,
    'neuron_spawn_dissolve_delay_seconds' : IDL.Nat64,
    'minimum_icp_xdr_rate' : IDL.Nat64,
    'maximum_node_provider_rewards_e8s' : IDL.Nat64,
  });
  const ApproveGenesisKyc = IDL.Record({
    'principals' : IDL.Vec(IDL.Principal),
  });
  const Change = IDL.Variant({
    'ToRemove' : NodeProvider,
    'ToAdd' : NodeProvider,
  });
  const AddOrRemoveNodeProvider = IDL.Record({ 'change' : IDL.Opt(Change) });
  const Motion = IDL.Record({ 'motion_text' : IDL.Text });
  const Action = IDL.Variant({
    'RegisterKnownNeuron' : KnownNeuron,
    'ManageNeuron' : ManageNeuron,
    'ExecuteNnsFunction' : ExecuteNnsFunction,
    'RewardNodeProvider' : RewardNodeProvider,
    'SetDefaultFollowees' : SetDefaultFollowees,
    'RewardNodeProviders' : RewardNodeProviders,
    'ManageNetworkEconomics' : NetworkEconomics,
    'ApproveGenesisKyc' : ApproveGenesisKyc,
    'AddOrRemoveNodeProvider' : AddOrRemoveNodeProvider,
    'Motion' : Motion,
  });
  Proposal.fill(
    IDL.Record({
      'url' : IDL.Text,
      'title' : IDL.Opt(IDL.Text),
      'action' : IDL.Opt(Action),
      'summary' : IDL.Text,
    })
  );
  const ProposalInfo = IDL.Record({
    'id' : IDL.Opt(NeuronId),
    'status' : IDL.Int32,
    'topic' : IDL.Int32,
    'failure_reason' : IDL.Opt(GovernanceError),
    'ballots' : IDL.Vec(IDL.Tuple(IDL.Nat64, Ballot)),
    'proposal_timestamp_seconds' : IDL.Nat64,
    'reward_event_round' : IDL.Nat64,
    'deadline_timestamp_seconds' : IDL.Opt(IDL.Nat64),
    'failed_timestamp_seconds' : IDL.Nat64,
    'reject_cost_e8s' : IDL.Nat64,
    'latest_tally' : IDL.Opt(Tally),
    'reward_status' : IDL.Int32,
    'decided_timestamp_seconds' : IDL.Nat64,
    'proposal' : IDL.Opt(Proposal),
    'proposer' : IDL.Opt(NeuronId),
    'executed_timestamp_seconds' : IDL.Nat64,
  });
  const GetProposalResponse = IDL.Variant({
    'Ok' : ProposalInfo,
    'Err' : IDL.Text,
  });
  const Stats = IDL.Record({
    'latest_transaction_block_height' : BlockHeight,
    'seconds_since_last_ledger_sync' : IDL.Nat64,
    'sub_accounts_count' : IDL.Nat64,
    'neurons_topped_up_count' : IDL.Nat64,
    'transactions_to_process_queue_length' : IDL.Nat32,
    'neurons_created_count' : IDL.Nat64,
    'hardware_wallet_accounts_count' : IDL.Nat64,
    'accounts_count' : IDL.Nat64,
    'earliest_transaction_block_height' : BlockHeight,
    'transactions_count' : IDL.Nat64,
    'block_height_synced_up_to' : IDL.Opt(IDL.Nat64),
    'latest_transaction_timestamp_nanos' : IDL.Nat64,
    'earliest_transaction_timestamp_nanos' : IDL.Nat64,
  });
  const GetTransactionsRequest = IDL.Record({
    'page_size' : IDL.Nat8,
    'offset' : IDL.Nat32,
    'account_identifier' : AccountIdentifierText,
  });
  const TransactionType = IDL.Variant({
    'Burn' : IDL.Null,
    'Mint' : IDL.Null,
    'StakeNeuronNotification' : IDL.Null,
    'TopUpCanister' : CanisterId,
    'CreateCanister' : IDL.Null,
    'Transfer' : IDL.Null,
    'TopUpNeuron' : IDL.Null,
    'StakeNeuron' : IDL.Null,
  });
  const Timestamp = IDL.Record({ 'timestamp_nanos' : IDL.Nat64 });
  const ICPTs = IDL.Record({ 'e8s' : IDL.Nat64 });
  const Send = IDL.Record({
    'to' : AccountIdentifierText,
    'fee' : ICPTs,
    'amount' : ICPTs,
  });
  const Receive = IDL.Record({
    'fee' : ICPTs,
    'from' : AccountIdentifierText,
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
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
  });
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
    'status_code' : IDL.Nat16,
  });
  const RegisterHardwareWalletRequest = IDL.Record({
    'principal' : IDL.Principal,
    'name' : IDL.Text,
  });
  const RegisterHardwareWalletResponse = IDL.Variant({
    'Ok' : IDL.Null,
    'AccountNotFound' : IDL.Null,
    'HardwareWalletAlreadyRegistered' : IDL.Null,
    'HardwareWalletLimitExceeded' : IDL.Null,
    'NameTooLong' : IDL.Null,
  });
  const RenameSubAccountRequest = IDL.Record({
    'new_name' : IDL.Text,
    'account_identifier' : AccountIdentifierText,
  });
  const RenameSubAccountResponse = IDL.Variant({
    'Ok' : IDL.Null,
    'AccountNotFound' : IDL.Null,
    'SubAccountNotFound' : IDL.Null,
    'NameTooLong' : IDL.Null,
  });
  return IDL.Service({
    'add_account' : IDL.Func([], [AccountIdentifierText], []),
    'add_stable_asset' : IDL.Func([IDL.Vec(IDL.Nat8)], [], []),
    'attach_canister' : IDL.Func(
        [AttachCanisterRequest],
        [AttachCanisterResponse],
        [],
      ),
    'create_sub_account' : IDL.Func([IDL.Text], [CreateSubAccountResponse], []),
    'detach_canister' : IDL.Func(
        [DetachCanisterRequest],
        [DetachCanisterResponse],
        [],
      ),
    'get_account' : IDL.Func([], [GetAccountResponse], ['query']),
    'get_canisters' : IDL.Func([], [IDL.Vec(CanisterDetails)], ['query']),
    'get_multi_part_transaction_errors' : IDL.Func(
        [],
        [IDL.Vec(MultiPartTransactionError)],
        ['query'],
      ),
    'get_multi_part_transaction_status' : IDL.Func(
        [IDL.Principal, BlockHeight],
        [MultiPartTransactionStatus],
        ['query'],
      ),
    'get_proposal' : IDL.Func([IDL.Nat64], [GetProposalResponse], []),
    'get_stats' : IDL.Func([], [Stats], ['query']),
    'get_transactions' : IDL.Func(
        [GetTransactionsRequest],
        [GetTransactionsResponse],
        ['query'],
      ),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'register_hardware_wallet' : IDL.Func(
        [RegisterHardwareWalletRequest],
        [RegisterHardwareWalletResponse],
        [],
      ),
    'rename_sub_account' : IDL.Func(
        [RenameSubAccountRequest],
        [RenameSubAccountResponse],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
