// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
#![allow(dead_code, unused_imports)]
use candid::{self, CandidType, Deserialize, Principal, Encode, Decode};
use ic_cdk::api::call::CallResult as Result;

#[derive(CandidType, Deserialize)]
pub struct NeuronId { id: u64 }

#[derive(CandidType, Deserialize)]
pub struct Followees { followees: Vec<NeuronId> }

#[derive(CandidType, Deserialize)]
pub struct KnownNeuronData { name: String, description: Option<String> }

#[derive(CandidType, Deserialize)]
pub struct KnownNeuron {
  id: Option<NeuronId>,
  known_neuron_data: Option<KnownNeuronData>,
}

#[derive(CandidType, Deserialize)]
pub struct Spawn {
  percentage_to_spawn: Option<u32>,
  new_controller: Option<Principal>,
  nonce: Option<u64>,
}

#[derive(CandidType, Deserialize)]
pub struct Split { amount_e8s: u64 }

#[derive(CandidType, Deserialize)]
pub struct Follow { topic: i32, followees: Vec<NeuronId> }

#[derive(CandidType, Deserialize)]
pub struct ClaimOrRefreshNeuronFromAccount {
  controller: Option<Principal>,
  memo: u64,
}

#[derive(CandidType, Deserialize)]
pub enum By {
  NeuronIdOrSubaccount,
  MemoAndController(ClaimOrRefreshNeuronFromAccount),
  Memo(u64),
}

#[derive(CandidType, Deserialize)]
pub struct ClaimOrRefresh { by: Option<By> }

#[derive(CandidType, Deserialize)]
pub struct RemoveHotKey { hot_key_to_remove: Option<Principal> }

#[derive(CandidType, Deserialize)]
pub struct AddHotKey { new_hot_key: Option<Principal> }

#[derive(CandidType, Deserialize)]
pub struct ChangeAutoStakeMaturity {
  requested_setting_for_auto_stake_maturity: bool,
}

#[derive(CandidType, Deserialize)]
pub struct IncreaseDissolveDelay { additional_dissolve_delay_seconds: u32 }

#[derive(CandidType, Deserialize)]
pub struct SetDissolveTimestamp { dissolve_timestamp_seconds: u64 }

#[derive(CandidType, Deserialize)]
pub enum Operation {
  RemoveHotKey(RemoveHotKey),
  AddHotKey(AddHotKey),
  ChangeAutoStakeMaturity(ChangeAutoStakeMaturity),
  StopDissolving,
  StartDissolving,
  IncreaseDissolveDelay(IncreaseDissolveDelay),
  JoinCommunityFund,
  LeaveCommunityFund,
  SetDissolveTimestamp(SetDissolveTimestamp),
}

#[derive(CandidType, Deserialize)]
pub struct Configure { operation: Option<Operation> }

#[derive(CandidType, Deserialize)]
pub struct RegisterVote { vote: i32, proposal: Option<NeuronId> }

#[derive(CandidType, Deserialize)]
pub struct Merge { source_neuron_id: Option<NeuronId> }

#[derive(CandidType, Deserialize)]
pub struct DisburseToNeuron {
  dissolve_delay_seconds: u64,
  kyc_verified: bool,
  amount_e8s: u64,
  new_controller: Option<Principal>,
  nonce: u64,
}

#[derive(CandidType, Deserialize)]
pub struct StakeMaturity { percentage_to_stake: Option<u32> }

#[derive(CandidType, Deserialize)]
pub struct MergeMaturity { percentage_to_merge: u32 }

#[derive(CandidType, Deserialize)]
pub struct AccountIdentifier { hash: serde_bytes::ByteBuf }

#[derive(CandidType, Deserialize)]
pub struct Amount { e8s: u64 }

#[derive(CandidType, Deserialize)]
pub struct Disburse {
  to_account: Option<AccountIdentifier>,
  amount: Option<Amount>,
}

#[derive(CandidType, Deserialize)]
pub enum Command {
  Spawn(Spawn),
  Split(Split),
  Follow(Follow),
  ClaimOrRefresh(ClaimOrRefresh),
  Configure(Configure),
  RegisterVote(RegisterVote),
  Merge(Merge),
  DisburseToNeuron(DisburseToNeuron),
  MakeProposal(Box<Proposal>),
  StakeMaturity(StakeMaturity),
  MergeMaturity(MergeMaturity),
  Disburse(Disburse),
}

#[derive(CandidType, Deserialize)]
pub enum NeuronIdOrSubaccount {
  Subaccount(serde_bytes::ByteBuf),
  NeuronId(NeuronId),
}

#[derive(CandidType, Deserialize)]
pub struct ManageNeuron {
  id: Option<NeuronId>,
  command: Option<Command>,
  neuron_id_or_subaccount: Option<NeuronIdOrSubaccount>,
}

#[derive(CandidType, Deserialize)]
pub struct Percentage { basis_points: Option<u64> }

#[derive(CandidType, Deserialize)]
pub struct Duration { seconds: Option<u64> }

#[derive(CandidType, Deserialize)]
pub struct Tokens { e8s: Option<u64> }

#[derive(CandidType, Deserialize)]
pub struct VotingRewardParameters {
  reward_rate_transition_duration: Option<Duration>,
  initial_reward_rate: Option<Percentage>,
  final_reward_rate: Option<Percentage>,
}

#[derive(CandidType, Deserialize)]
pub struct GovernanceParameters {
  neuron_maximum_dissolve_delay_bonus: Option<Percentage>,
  neuron_maximum_age_for_age_bonus: Option<Duration>,
  neuron_maximum_dissolve_delay: Option<Duration>,
  neuron_minimum_dissolve_delay_to_vote: Option<Duration>,
  neuron_maximum_age_bonus: Option<Percentage>,
  neuron_minimum_stake: Option<Tokens>,
  proposal_wait_for_quiet_deadline_increase: Option<Duration>,
  proposal_initial_voting_period: Option<Duration>,
  proposal_rejection_fee: Option<Tokens>,
  voting_reward_parameters: Option<VotingRewardParameters>,
}

#[derive(CandidType, Deserialize)]
pub struct Image { base64_encoding: Option<String> }

#[derive(CandidType, Deserialize)]
pub struct LedgerParameters {
  transaction_fee: Option<Tokens>,
  token_symbol: Option<String>,
  token_logo: Option<Image>,
  token_name: Option<String>,
}

#[derive(CandidType, Deserialize)]
pub struct Canister { id: Option<Principal> }

#[derive(CandidType, Deserialize)]
pub struct NeuronBasketConstructionParameters {
  dissolve_delay_interval: Option<Duration>,
  count: Option<u64>,
}

#[derive(CandidType, Deserialize)]
pub struct GlobalTimeOfDay { seconds_after_utc_midnight: Option<u64> }

#[derive(CandidType, Deserialize)]
pub struct Countries { iso_codes: Vec<String> }

#[derive(CandidType, Deserialize)]
pub struct SwapParameters {
  minimum_participants: Option<u64>,
  duration: Option<Duration>,
  neuron_basket_construction_parameters: Option<
    NeuronBasketConstructionParameters
  >,
  confirmation_text: Option<String>,
  maximum_participant_icp: Option<Tokens>,
  minimum_icp: Option<Tokens>,
  minimum_participant_icp: Option<Tokens>,
  start_time: Option<GlobalTimeOfDay>,
  maximum_icp: Option<Tokens>,
  neurons_fund_investment_icp: Option<Tokens>,
  restricted_countries: Option<Countries>,
}

#[derive(CandidType, Deserialize)]
pub struct SwapDistribution { total: Option<Tokens> }

#[derive(CandidType, Deserialize)]
pub struct NeuronDistribution {
  controller: Option<Principal>,
  dissolve_delay: Option<Duration>,
  memo: Option<u64>,
  vesting_period: Option<Duration>,
  stake: Option<Tokens>,
}

#[derive(CandidType, Deserialize)]
pub struct DeveloperDistribution { developer_neurons: Vec<NeuronDistribution> }

#[derive(CandidType, Deserialize)]
pub struct InitialTokenDistribution {
  treasury_distribution: Option<SwapDistribution>,
  developer_distribution: Option<DeveloperDistribution>,
  swap_distribution: Option<SwapDistribution>,
}

#[derive(CandidType, Deserialize)]
pub struct CreateServiceNervousSystem {
  url: Option<String>,
  governance_parameters: Option<GovernanceParameters>,
  fallback_controller_principal_ids: Vec<Principal>,
  logo: Option<Image>,
  name: Option<String>,
  ledger_parameters: Option<LedgerParameters>,
  description: Option<String>,
  dapp_canisters: Vec<Canister>,
  swap_parameters: Option<SwapParameters>,
  initial_token_distribution: Option<InitialTokenDistribution>,
}

#[derive(CandidType, Deserialize)]
pub struct ExecuteNnsFunction {
  pub nns_function: i32,
  pub payload: serde_bytes::ByteBuf,
}

#[derive(CandidType, Deserialize)]
pub struct NodeProvider {
  id: Option<Principal>,
  reward_account: Option<AccountIdentifier>,
}

#[derive(CandidType, Deserialize)]
pub struct RewardToNeuron { dissolve_delay_seconds: u64 }

#[derive(CandidType, Deserialize)]
pub struct RewardToAccount { to_account: Option<AccountIdentifier> }

#[derive(CandidType, Deserialize)]
pub enum RewardMode {
  RewardToNeuron(RewardToNeuron),
  RewardToAccount(RewardToAccount),
}

#[derive(CandidType, Deserialize)]
pub struct RewardNodeProvider {
  node_provider: Option<NodeProvider>,
  reward_mode: Option<RewardMode>,
  amount_e8s: u64,
}

#[derive(CandidType, Deserialize)]
pub struct NeuronBasketConstructionParameters1 {
  dissolve_delay_interval_seconds: u64,
  count: u64,
}

#[derive(CandidType, Deserialize)]
pub struct Params {
  min_participant_icp_e8s: u64,
  neuron_basket_construction_parameters: Option<
    NeuronBasketConstructionParameters1
  >,
  max_icp_e8s: u64,
  swap_due_timestamp_seconds: u64,
  min_participants: u32,
  sns_token_e8s: u64,
  sale_delay_seconds: Option<u64>,
  max_participant_icp_e8s: u64,
  min_icp_e8s: u64,
}

#[derive(CandidType, Deserialize)]
pub struct OpenSnsTokenSwap {
  community_fund_investment_e8s: Option<u64>,
  target_swap_canister_id: Option<Principal>,
  params: Option<Params>,
}

#[derive(CandidType, Deserialize)]
pub struct TimeWindow {
  start_timestamp_seconds: u64,
  end_timestamp_seconds: u64,
}

#[derive(CandidType, Deserialize)]
pub struct SetOpenTimeWindowRequest { open_time_window: Option<TimeWindow> }

#[derive(CandidType, Deserialize)]
pub struct SetSnsTokenSwapOpenTimeWindow {
  request: Option<SetOpenTimeWindowRequest>,
  swap_canister_id: Option<Principal>,
}

#[derive(CandidType, Deserialize)]
pub struct SetDefaultFollowees { default_followees: Vec<(i32,Followees,)> }

#[derive(CandidType, Deserialize)]
pub struct RewardNodeProviders {
  use_registry_derived_rewards: Option<bool>,
  rewards: Vec<RewardNodeProvider>,
}

#[derive(CandidType, Deserialize)]
pub struct NetworkEconomics {
  neuron_minimum_stake_e8s: u64,
  max_proposals_to_keep_per_topic: u32,
  neuron_management_fee_per_proposal_e8s: u64,
  reject_cost_e8s: u64,
  transaction_fee_e8s: u64,
  neuron_spawn_dissolve_delay_seconds: u64,
  minimum_icp_xdr_rate: u64,
  maximum_node_provider_rewards_e8s: u64,
}

#[derive(CandidType, Deserialize)]
pub struct ApproveGenesisKyc { principals: Vec<Principal> }

#[derive(CandidType, Deserialize)]
pub enum Change { ToRemove(NodeProvider), ToAdd(NodeProvider) }

#[derive(CandidType, Deserialize)]
pub struct AddOrRemoveNodeProvider { change: Option<Change> }

#[derive(CandidType, Deserialize)]
pub struct Motion { motion_text: String }

#[derive(CandidType, Deserialize)]
pub enum Action {
  RegisterKnownNeuron(KnownNeuron),
  ManageNeuron(ManageNeuron),
  CreateServiceNervousSystem(CreateServiceNervousSystem),
  ExecuteNnsFunction(ExecuteNnsFunction),
  RewardNodeProvider(RewardNodeProvider),
  OpenSnsTokenSwap(OpenSnsTokenSwap),
  SetSnsTokenSwapOpenTimeWindow(SetSnsTokenSwapOpenTimeWindow),
  SetDefaultFollowees(SetDefaultFollowees),
  RewardNodeProviders(RewardNodeProviders),
  ManageNetworkEconomics(NetworkEconomics),
  ApproveGenesisKyc(ApproveGenesisKyc),
  AddOrRemoveNodeProvider(AddOrRemoveNodeProvider),
  Motion(Motion),
}

#[derive(CandidType, Deserialize)]
pub struct Proposal {
  pub url: String,
  pub title: Option<String>,
  pub action: Option<Action>,
  pub summary: String,
}

#[derive(CandidType, Deserialize)]
pub struct MakingSnsProposal {
  proposal: Option<Box<Proposal>>,
  caller: Option<Principal>,
  proposer_id: Option<NeuronId>,
}

#[derive(CandidType, Deserialize)]
pub struct MostRecentMonthlyNodeProviderRewards {
  timestamp: u64,
  rewards: Vec<RewardNodeProvider>,
}

#[derive(CandidType, Deserialize)]
pub struct GovernanceCachedMetrics {
  total_maturity_e8s_equivalent: u64,
  not_dissolving_neurons_e8s_buckets: Vec<(u64,f64,)>,
  dissolving_neurons_staked_maturity_e8s_equivalent_sum: u64,
  garbage_collectable_neurons_count: u64,
  dissolving_neurons_staked_maturity_e8s_equivalent_buckets: Vec<(u64,f64,)>,
  neurons_with_invalid_stake_count: u64,
  not_dissolving_neurons_count_buckets: Vec<(u64,u64,)>,
  total_supply_icp: u64,
  neurons_with_less_than_6_months_dissolve_delay_count: u64,
  dissolved_neurons_count: u64,
  community_fund_total_maturity_e8s_equivalent: u64,
  total_staked_e8s: u64,
  not_dissolving_neurons_count: u64,
  total_locked_e8s: u64,
  neurons_fund_total_active_neurons: u64,
  total_staked_maturity_e8s_equivalent: u64,
  not_dissolving_neurons_staked_maturity_e8s_equivalent_sum: u64,
  dissolved_neurons_e8s: u64,
  neurons_with_less_than_6_months_dissolve_delay_e8s: u64,
  not_dissolving_neurons_staked_maturity_e8s_equivalent_buckets: Vec<
    (u64,f64,)
  >,
  dissolving_neurons_count_buckets: Vec<(u64,u64,)>,
  dissolving_neurons_count: u64,
  dissolving_neurons_e8s_buckets: Vec<(u64,f64,)>,
  community_fund_total_staked_e8s: u64,
  timestamp_seconds: u64,
}

#[derive(CandidType, Deserialize)]
pub struct RewardEvent {
  rounds_since_last_distribution: Option<u64>,
  day_after_genesis: u64,
  actual_timestamp_seconds: u64,
  total_available_e8s_equivalent: u64,
  latest_round_available_e8s_equivalent: Option<u64>,
  distributed_e8s_equivalent: u64,
  settled_proposals: Vec<NeuronId>,
}

#[derive(CandidType, Deserialize)]
pub struct NeuronStakeTransfer {
  to_subaccount: serde_bytes::ByteBuf,
  neuron_stake_e8s: u64,
  from: Option<Principal>,
  memo: u64,
  from_subaccount: serde_bytes::ByteBuf,
  transfer_timestamp: u64,
  block_height: u64,
}

#[derive(CandidType, Deserialize)]
pub enum Progress { LastNeuronId(NeuronId) }

#[derive(CandidType, Deserialize)]
pub struct Migration {
  status: Option<i32>,
  failure_reason: Option<String>,
  progress: Option<Progress>,
}

#[derive(CandidType, Deserialize)]
pub struct Migrations {
  neuron_indexes_migration: Option<Migration>,
  copy_inactive_neurons_to_stable_memory_migration: Option<Migration>,
}

#[derive(CandidType, Deserialize)]
pub struct GovernanceError { error_message: String, error_type: i32 }

#[derive(CandidType, Deserialize)]
pub struct CfNeuron { nns_neuron_id: u64, amount_icp_e8s: u64 }

#[derive(CandidType, Deserialize)]
pub struct CfParticipant { hotkey_principal: String, cf_neurons: Vec<CfNeuron> }

#[derive(CandidType, Deserialize)]
pub struct Ballot { vote: i32, voting_power: u64 }

#[derive(CandidType, Deserialize)]
pub struct CanisterStatusResultV2 {
  status: Option<i32>,
  freezing_threshold: Option<u64>,
  controllers: Vec<Principal>,
  memory_size: Option<u64>,
  cycles: Option<u64>,
  idle_cycles_burned_per_day: Option<u64>,
  module_hash: serde_bytes::ByteBuf,
}

#[derive(CandidType, Deserialize)]
pub struct CanisterSummary {
  status: Option<CanisterStatusResultV2>,
  canister_id: Option<Principal>,
}

#[derive(CandidType, Deserialize)]
pub struct SwapBackgroundInformation {
  ledger_index_canister_summary: Option<CanisterSummary>,
  fallback_controller_principal_ids: Vec<Principal>,
  ledger_archive_canister_summaries: Vec<CanisterSummary>,
  ledger_canister_summary: Option<CanisterSummary>,
  swap_canister_summary: Option<CanisterSummary>,
  governance_canister_summary: Option<CanisterSummary>,
  root_canister_summary: Option<CanisterSummary>,
  dapp_canister_summaries: Vec<CanisterSummary>,
}

#[derive(CandidType, Deserialize)]
pub struct DerivedProposalInformation {
  swap_background_information: Option<SwapBackgroundInformation>,
}

#[derive(CandidType, Deserialize)]
pub struct Tally { no: u64, yes: u64, total: u64, timestamp_seconds: u64 }

#[derive(CandidType, Deserialize)]
pub struct WaitForQuietState { current_deadline_timestamp_seconds: u64 }

#[derive(CandidType, Deserialize)]
pub struct ProposalData {
  id: Option<NeuronId>,
  failure_reason: Option<GovernanceError>,
  cf_participants: Vec<CfParticipant>,
  ballots: Vec<(u64,Ballot,)>,
  proposal_timestamp_seconds: u64,
  reward_event_round: u64,
  failed_timestamp_seconds: u64,
  reject_cost_e8s: u64,
  derived_proposal_information: Option<DerivedProposalInformation>,
  latest_tally: Option<Tally>,
  sns_token_swap_lifecycle: Option<i32>,
  decided_timestamp_seconds: u64,
  proposal: Option<Box<Proposal>>,
  proposer: Option<NeuronId>,
  wait_for_quiet_state: Option<WaitForQuietState>,
  executed_timestamp_seconds: u64,
  original_total_community_fund_maturity_e8s_equivalent: Option<u64>,
}

#[derive(CandidType, Deserialize)]
pub enum Command2 {
  Spawn(NeuronId),
  Split(Split),
  Configure(Configure),
  Merge(Merge),
  DisburseToNeuron(DisburseToNeuron),
  SyncCommand,
  ClaimOrRefreshNeuron(ClaimOrRefresh),
  MergeMaturity(MergeMaturity),
  Disburse(Disburse),
}

#[derive(CandidType, Deserialize)]
pub struct NeuronInFlightCommand { command: Option<Command2>, timestamp: u64 }

#[derive(CandidType, Deserialize)]
pub struct BallotInfo { vote: i32, proposal_id: Option<NeuronId> }

#[derive(CandidType, Deserialize)]
pub enum DissolveState {
  DissolveDelaySeconds(u64),
  WhenDissolvedTimestampSeconds(u64),
}

#[derive(CandidType, Deserialize)]
pub struct Neuron {
  id: Option<NeuronId>,
  staked_maturity_e8s_equivalent: Option<u64>,
  controller: Option<Principal>,
  recent_ballots: Vec<BallotInfo>,
  kyc_verified: bool,
  not_for_profit: bool,
  maturity_e8s_equivalent: u64,
  cached_neuron_stake_e8s: u64,
  created_timestamp_seconds: u64,
  auto_stake_maturity: Option<bool>,
  aging_since_timestamp_seconds: u64,
  hot_keys: Vec<Principal>,
  account: serde_bytes::ByteBuf,
  joined_community_fund_timestamp_seconds: Option<u64>,
  dissolve_state: Option<DissolveState>,
  followees: Vec<(i32,Followees,)>,
  neuron_fees_e8s: u64,
  transfer: Option<NeuronStakeTransfer>,
  known_neuron_data: Option<KnownNeuronData>,
  spawn_at_timestamp_seconds: Option<u64>,
}

#[derive(CandidType, Deserialize)]
pub struct Governance {
  default_followees: Vec<(i32,Followees,)>,
  making_sns_proposal: Option<MakingSnsProposal>,
  most_recent_monthly_node_provider_rewards: Option<
    MostRecentMonthlyNodeProviderRewards
  >,
  maturity_modulation_last_updated_at_timestamp_seconds: Option<u64>,
  wait_for_quiet_threshold_seconds: u64,
  metrics: Option<GovernanceCachedMetrics>,
  neuron_management_voting_period_seconds: Option<u64>,
  node_providers: Vec<NodeProvider>,
  cached_daily_maturity_modulation_basis_points: Option<i32>,
  economics: Option<NetworkEconomics>,
  spawning_neurons: Option<bool>,
  latest_reward_event: Option<RewardEvent>,
  to_claim_transfers: Vec<NeuronStakeTransfer>,
  short_voting_period_seconds: u64,
  migrations: Option<Migrations>,
  proposals: Vec<(u64,ProposalData,)>,
  in_flight_commands: Vec<(u64,NeuronInFlightCommand,)>,
  neurons: Vec<(u64,Neuron,)>,
  genesis_timestamp_seconds: u64,
}

#[derive(CandidType, Deserialize)]
pub enum Result_ { Ok, Err(GovernanceError) }

#[derive(CandidType, Deserialize)]
pub enum Result1 { Error(GovernanceError), NeuronId(NeuronId) }

#[derive(CandidType, Deserialize)]
pub struct ClaimOrRefreshNeuronFromAccountResponse { result: Option<Result1> }

#[derive(CandidType, Deserialize)]
pub enum Result2 { Ok(Neuron), Err(GovernanceError) }

#[derive(CandidType, Deserialize)]
pub enum Result3 { Ok(GovernanceCachedMetrics), Err(GovernanceError) }

#[derive(CandidType, Deserialize)]
pub enum Result4 { Ok(RewardNodeProviders), Err(GovernanceError) }

#[derive(CandidType, Deserialize)]
pub struct NeuronInfo {
  dissolve_delay_seconds: u64,
  recent_ballots: Vec<BallotInfo>,
  created_timestamp_seconds: u64,
  state: i32,
  stake_e8s: u64,
  joined_community_fund_timestamp_seconds: Option<u64>,
  retrieved_at_timestamp_seconds: u64,
  known_neuron_data: Option<KnownNeuronData>,
  voting_power: u64,
  age_seconds: u64,
}

#[derive(CandidType, Deserialize)]
pub enum Result5 { Ok(NeuronInfo), Err(GovernanceError) }

#[derive(CandidType, Deserialize)]
pub enum Result6 { Ok(NodeProvider), Err(GovernanceError) }

#[derive(CandidType, Deserialize)]
pub struct ProposalInfo {
  id: Option<NeuronId>,
  status: i32,
  topic: i32,
  failure_reason: Option<GovernanceError>,
  ballots: Vec<(u64,Ballot,)>,
  proposal_timestamp_seconds: u64,
  reward_event_round: u64,
  deadline_timestamp_seconds: Option<u64>,
  failed_timestamp_seconds: u64,
  reject_cost_e8s: u64,
  derived_proposal_information: Option<DerivedProposalInformation>,
  latest_tally: Option<Tally>,
  reward_status: i32,
  decided_timestamp_seconds: u64,
  pub proposal: Option<Box<Proposal>>,
  proposer: Option<NeuronId>,
  executed_timestamp_seconds: u64,
}

#[derive(CandidType, Deserialize)]
pub struct ListKnownNeuronsResponse { known_neurons: Vec<KnownNeuron> }

#[derive(CandidType, Deserialize)]
pub struct ListNeurons {
  neuron_ids: Vec<u64>,
  include_neurons_readable_by_caller: bool,
}

#[derive(CandidType, Deserialize)]
pub struct ListNeuronsResponse {
  neuron_infos: Vec<(u64,NeuronInfo,)>,
  full_neurons: Vec<Neuron>,
}

#[derive(CandidType, Deserialize)]
pub struct ListNodeProvidersResponse { node_providers: Vec<NodeProvider> }

#[derive(CandidType, Deserialize)]
pub struct ListProposalInfo {
  include_reward_status: Vec<i32>,
  omit_large_fields: Option<bool>,
  before_proposal: Option<NeuronId>,
  limit: u32,
  exclude_topic: Vec<i32>,
  include_all_manage_neuron_proposals: Option<bool>,
  include_status: Vec<i32>,
}

#[derive(CandidType, Deserialize)]
pub struct ListProposalInfoResponse { proposal_info: Vec<ProposalInfo> }

#[derive(CandidType, Deserialize)]
pub struct SpawnResponse { created_neuron_id: Option<NeuronId> }

#[derive(CandidType, Deserialize)]
pub struct ClaimOrRefreshResponse { refreshed_neuron_id: Option<NeuronId> }

#[derive(CandidType, Deserialize)]
pub struct MergeResponse {
  target_neuron: Option<Neuron>,
  source_neuron: Option<Neuron>,
  target_neuron_info: Option<NeuronInfo>,
  source_neuron_info: Option<NeuronInfo>,
}

#[derive(CandidType, Deserialize)]
pub struct MakeProposalResponse { proposal_id: Option<NeuronId> }

#[derive(CandidType, Deserialize)]
pub struct StakeMaturityResponse { maturity_e8s: u64, staked_maturity_e8s: u64 }

#[derive(CandidType, Deserialize)]
pub struct MergeMaturityResponse {
  merged_maturity_e8s: u64,
  new_stake_e8s: u64,
}

#[derive(CandidType, Deserialize)]
pub struct DisburseResponse { transfer_block_height: u64 }

#[derive(CandidType, Deserialize)]
pub enum Command1 {
  Error(GovernanceError),
  Spawn(SpawnResponse),
  Split(SpawnResponse),
  Follow,
  ClaimOrRefresh(ClaimOrRefreshResponse),
  Configure,
  RegisterVote,
  Merge(MergeResponse),
  DisburseToNeuron(SpawnResponse),
  MakeProposal(MakeProposalResponse),
  StakeMaturity(StakeMaturityResponse),
  MergeMaturity(MergeMaturityResponse),
  Disburse(DisburseResponse),
}

#[derive(CandidType, Deserialize)]
pub struct ManageNeuronResponse { command: Option<Command1> }

#[derive(CandidType, Deserialize)]
pub struct Committed {
  total_direct_contribution_icp_e8s: Option<u64>,
  total_neurons_fund_contribution_icp_e8s: Option<u64>,
  sns_governance_canister_id: Option<Principal>,
}

#[derive(CandidType, Deserialize)]
pub enum Result7 { Committed(Committed), Aborted }

#[derive(CandidType, Deserialize)]
pub struct SettleCommunityFundParticipation {
  result: Option<Result7>,
  open_sns_token_swap_proposal_id: Option<u64>,
}

#[derive(CandidType, Deserialize)]
pub struct UpdateNodeProvider { reward_account: Option<AccountIdentifier> }

pub struct Service(pub Principal);
impl Service {
  pub async fn claim_gtc_neurons(
    &self,
    arg0: Principal,
    arg1: Vec<NeuronId>,
  ) -> Result<(Result_,)> {
    ic_cdk::call(self.0, "claim_gtc_neurons", (arg0,arg1,)).await
  }
  pub async fn claim_or_refresh_neuron_from_account(
    &self,
    arg0: ClaimOrRefreshNeuronFromAccount,
  ) -> Result<(ClaimOrRefreshNeuronFromAccountResponse,)> {
    ic_cdk::call(self.0, "claim_or_refresh_neuron_from_account", (arg0,)).await
  }
  pub async fn get_build_metadata(&self) -> Result<(String,)> {
    ic_cdk::call(self.0, "get_build_metadata", ()).await
  }
  pub async fn get_full_neuron(&self, arg0: u64) -> Result<(Result2,)> {
    ic_cdk::call(self.0, "get_full_neuron", (arg0,)).await
  }
  pub async fn get_full_neuron_by_id_or_subaccount(
    &self,
    arg0: NeuronIdOrSubaccount,
  ) -> Result<(Result2,)> {
    ic_cdk::call(self.0, "get_full_neuron_by_id_or_subaccount", (arg0,)).await
  }
  pub async fn get_latest_reward_event(&self) -> Result<(RewardEvent,)> {
    ic_cdk::call(self.0, "get_latest_reward_event", ()).await
  }
  pub async fn get_metrics(&self) -> Result<(Result3,)> {
    ic_cdk::call(self.0, "get_metrics", ()).await
  }
  pub async fn get_monthly_node_provider_rewards(&self) -> Result<(Result4,)> {
    ic_cdk::call(self.0, "get_monthly_node_provider_rewards", ()).await
  }
  pub async fn get_most_recent_monthly_node_provider_rewards(&self) -> Result<
    (Option<MostRecentMonthlyNodeProviderRewards>,)
  > {
    ic_cdk::call(self.0, "get_most_recent_monthly_node_provider_rewards", ()).await
  }
  pub async fn get_network_economics_parameters(&self) -> Result<
    (NetworkEconomics,)
  > { ic_cdk::call(self.0, "get_network_economics_parameters", ()).await }
  pub async fn get_neuron_ids(&self) -> Result<(Vec<u64>,)> {
    ic_cdk::call(self.0, "get_neuron_ids", ()).await
  }
  pub async fn get_neuron_info(&self, arg0: u64) -> Result<(Result5,)> {
    ic_cdk::call(self.0, "get_neuron_info", (arg0,)).await
  }
  pub async fn get_neuron_info_by_id_or_subaccount(
    &self,
    arg0: NeuronIdOrSubaccount,
  ) -> Result<(Result5,)> {
    ic_cdk::call(self.0, "get_neuron_info_by_id_or_subaccount", (arg0,)).await
  }
  pub async fn get_node_provider_by_caller(&self, arg0: ()) -> Result<
    (Result6,)
  > { ic_cdk::call(self.0, "get_node_provider_by_caller", (arg0,)).await }
  pub async fn get_pending_proposals(&self) -> Result<(Vec<ProposalInfo>,)> {
    ic_cdk::call(self.0, "get_pending_proposals", ()).await
  }
  pub async fn get_proposal_info(&self, arg0: u64) -> Result<
    (Option<ProposalInfo>,)
  > { ic_cdk::call(self.0, "get_proposal_info", (arg0,)).await }
  pub async fn list_known_neurons(&self) -> Result<
    (ListKnownNeuronsResponse,)
  > { ic_cdk::call(self.0, "list_known_neurons", ()).await }
  pub async fn list_neurons(&self, arg0: ListNeurons) -> Result<
    (ListNeuronsResponse,)
  > { ic_cdk::call(self.0, "list_neurons", (arg0,)).await }
  pub async fn list_node_providers(&self) -> Result<
    (ListNodeProvidersResponse,)
  > { ic_cdk::call(self.0, "list_node_providers", ()).await }
  pub async fn list_proposals(&self, arg0: ListProposalInfo) -> Result<
    (ListProposalInfoResponse,)
  > { ic_cdk::call(self.0, "list_proposals", (arg0,)).await }
  pub async fn manage_neuron(&self, arg0: ManageNeuron) -> Result<
    (ManageNeuronResponse,)
  > { ic_cdk::call(self.0, "manage_neuron", (arg0,)).await }
  pub async fn settle_community_fund_participation(
    &self,
    arg0: SettleCommunityFundParticipation,
  ) -> Result<(Result_,)> {
    ic_cdk::call(self.0, "settle_community_fund_participation", (arg0,)).await
  }
  pub async fn simulate_manage_neuron(&self, arg0: ManageNeuron) -> Result<
    (ManageNeuronResponse,)
  > { ic_cdk::call(self.0, "simulate_manage_neuron", (arg0,)).await }
  pub async fn transfer_gtc_neuron(
    &self,
    arg0: NeuronId,
    arg1: NeuronId,
  ) -> Result<(Result_,)> {
    ic_cdk::call(self.0, "transfer_gtc_neuron", (arg0,arg1,)).await
  }
  pub async fn update_node_provider(&self, arg0: UpdateNodeProvider) -> Result<
    (Result_,)
  > { ic_cdk::call(self.0, "update_node_provider", (arg0,)).await }
}

