#![allow(clippy::all)]
#![allow(clippy::missing_docs_in_private_items)]
#![allow(non_camel_case_types)]
#![allow(dead_code, unused_imports)]
use candid::{self, CandidType, Decode, Deserialize, Encode, Principal};
use ic_cdk::api::call::CallResult as Result;
use serde::Serialize;

#[derive(Serialize, CandidType, Deserialize)]
pub struct EmptyRecord {}

// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
// #![allow(dead_code, unused_imports)]
// use candid::{self, CandidType, Decode, Deserialize, Encode, Principal};
// use ic_cdk::api::call::CallResult as Result;

#[derive(Serialize, CandidType, Deserialize)]
pub struct NeuronId {
    pub id: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct Followees {
    pub followees: Vec<NeuronId>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct KnownNeuronData {
    pub name: String,
    pub description: Option<String>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct KnownNeuron {
    pub id: Option<NeuronId>,
    pub known_neuron_data: Option<KnownNeuronData>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct Spawn {
    pub percentage_to_spawn: Option<u32>,
    pub new_controller: Option<Principal>,
    pub nonce: Option<u64>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct Split {
    pub amount_e8s: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct Follow {
    pub topic: i32,
    pub followees: Vec<NeuronId>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct ClaimOrRefreshNeuronFromAccount {
    pub controller: Option<Principal>,
    pub memo: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub enum By {
    NeuronIdOrSubaccount(EmptyRecord),
    MemoAndController(ClaimOrRefreshNeuronFromAccount),
    Memo(u64),
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct ClaimOrRefresh {
    pub by: Option<By>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct RemoveHotKey {
    pub hot_key_to_remove: Option<Principal>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct AddHotKey {
    pub new_hot_key: Option<Principal>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct ChangeAutoStakeMaturity {
    pub requested_setting_for_auto_stake_maturity: bool,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct IncreaseDissolveDelay {
    pub additional_dissolve_delay_seconds: u32,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct SetDissolveTimestamp {
    pub dissolve_timestamp_seconds: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub enum Operation {
    RemoveHotKey(RemoveHotKey),
    AddHotKey(AddHotKey),
    ChangeAutoStakeMaturity(ChangeAutoStakeMaturity),
    StopDissolving(EmptyRecord),
    StartDissolving(EmptyRecord),
    IncreaseDissolveDelay(IncreaseDissolveDelay),
    JoinCommunityFund(EmptyRecord),
    LeaveCommunityFund(EmptyRecord),
    SetDissolveTimestamp(SetDissolveTimestamp),
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct Configure {
    pub operation: Option<Operation>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct RegisterVote {
    pub vote: i32,
    pub proposal: Option<NeuronId>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct Merge {
    pub source_neuron_id: Option<NeuronId>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct DisburseToNeuron {
    pub dissolve_delay_seconds: u64,
    pub kyc_verified: bool,
    pub amount_e8s: u64,
    pub new_controller: Option<Principal>,
    pub nonce: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct StakeMaturity {
    pub percentage_to_stake: Option<u32>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct MergeMaturity {
    pub percentage_to_merge: u32,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct AccountIdentifier {
    pub hash: serde_bytes::ByteBuf,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct Amount {
    pub e8s: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct Disburse {
    pub to_account: Option<AccountIdentifier>,
    pub amount: Option<Amount>,
}

#[derive(Serialize, CandidType, Deserialize)]
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

#[derive(Serialize, CandidType, Deserialize)]
pub enum NeuronIdOrSubaccount {
    Subaccount(serde_bytes::ByteBuf),
    NeuronId(NeuronId),
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct ManageNeuron {
    pub id: Option<NeuronId>,
    pub command: Option<Command>,
    pub neuron_id_or_subaccount: Option<NeuronIdOrSubaccount>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct Percentage {
    pub basis_points: Option<u64>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct Duration {
    pub seconds: Option<u64>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct Tokens {
    pub e8s: Option<u64>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct VotingRewardParameters {
    pub reward_rate_transition_duration: Option<Duration>,
    pub initial_reward_rate: Option<Percentage>,
    pub final_reward_rate: Option<Percentage>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct GovernanceParameters {
    pub neuron_maximum_dissolve_delay_bonus: Option<Percentage>,
    pub neuron_maximum_age_for_age_bonus: Option<Duration>,
    pub neuron_maximum_dissolve_delay: Option<Duration>,
    pub neuron_minimum_dissolve_delay_to_vote: Option<Duration>,
    pub neuron_maximum_age_bonus: Option<Percentage>,
    pub neuron_minimum_stake: Option<Tokens>,
    pub proposal_wait_for_quiet_deadline_increase: Option<Duration>,
    pub proposal_initial_voting_period: Option<Duration>,
    pub proposal_rejection_fee: Option<Tokens>,
    pub voting_reward_parameters: Option<VotingRewardParameters>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct Image {
    pub base64_encoding: Option<String>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct LedgerParameters {
    pub transaction_fee: Option<Tokens>,
    pub token_symbol: Option<String>,
    pub token_logo: Option<Image>,
    pub token_name: Option<String>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct Canister {
    pub id: Option<Principal>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct NeuronBasketConstructionParameters {
    pub dissolve_delay_interval: Option<Duration>,
    pub count: Option<u64>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct GlobalTimeOfDay {
    pub seconds_after_utc_midnight: Option<u64>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct Countries {
    pub iso_codes: Vec<String>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct SwapParameters {
    pub minimum_participants: Option<u64>,
    pub duration: Option<Duration>,
    pub neuron_basket_construction_parameters: Option<NeuronBasketConstructionParameters>,
    pub confirmation_text: Option<String>,
    pub maximum_participant_icp: Option<Tokens>,
    pub minimum_icp: Option<Tokens>,
    pub minimum_participant_icp: Option<Tokens>,
    pub start_time: Option<GlobalTimeOfDay>,
    pub maximum_icp: Option<Tokens>,
    pub neurons_fund_investment_icp: Option<Tokens>,
    pub restricted_countries: Option<Countries>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct SwapDistribution {
    pub total: Option<Tokens>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct NeuronDistribution {
    pub controller: Option<Principal>,
    pub dissolve_delay: Option<Duration>,
    pub memo: Option<u64>,
    pub vesting_period: Option<Duration>,
    pub stake: Option<Tokens>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct DeveloperDistribution {
    pub developer_neurons: Vec<NeuronDistribution>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct InitialTokenDistribution {
    pub treasury_distribution: Option<SwapDistribution>,
    pub developer_distribution: Option<DeveloperDistribution>,
    pub swap_distribution: Option<SwapDistribution>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct CreateServiceNervousSystem {
    pub url: Option<String>,
    pub governance_parameters: Option<GovernanceParameters>,
    pub fallback_controller_principal_ids: Vec<Principal>,
    pub logo: Option<Image>,
    pub name: Option<String>,
    pub ledger_parameters: Option<LedgerParameters>,
    pub description: Option<String>,
    pub dapp_canisters: Vec<Canister>,
    pub swap_parameters: Option<SwapParameters>,
    pub initial_token_distribution: Option<InitialTokenDistribution>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct ExecuteNnsFunction {
    pub nns_function: i32,
    pub payload: serde_bytes::ByteBuf,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct NodeProvider {
    pub id: Option<Principal>,
    pub reward_account: Option<AccountIdentifier>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct RewardToNeuron {
    pub dissolve_delay_seconds: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct RewardToAccount {
    pub to_account: Option<AccountIdentifier>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub enum RewardMode {
    RewardToNeuron(RewardToNeuron),
    RewardToAccount(RewardToAccount),
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct RewardNodeProvider {
    pub node_provider: Option<NodeProvider>,
    pub reward_mode: Option<RewardMode>,
    pub amount_e8s: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct NeuronBasketConstructionParameters1 {
    pub dissolve_delay_interval_seconds: u64,
    pub count: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct Params {
    pub min_participant_icp_e8s: u64,
    pub neuron_basket_construction_parameters: Option<NeuronBasketConstructionParameters1>,
    pub max_icp_e8s: u64,
    pub swap_due_timestamp_seconds: u64,
    pub min_participants: u32,
    pub sns_token_e8s: u64,
    pub sale_delay_seconds: Option<u64>,
    pub max_participant_icp_e8s: u64,
    pub min_icp_e8s: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct OpenSnsTokenSwap {
    pub community_fund_investment_e8s: Option<u64>,
    pub target_swap_canister_id: Option<Principal>,
    pub params: Option<Params>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct TimeWindow {
    pub start_timestamp_seconds: u64,
    pub end_timestamp_seconds: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct SetOpenTimeWindowRequest {
    pub open_time_window: Option<TimeWindow>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct SetSnsTokenSwapOpenTimeWindow {
    pub request: Option<SetOpenTimeWindowRequest>,
    pub swap_canister_id: Option<Principal>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct SetDefaultFollowees {
    pub default_followees: Vec<(i32, Followees)>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct RewardNodeProviders {
    pub use_registry_derived_rewards: Option<bool>,
    pub rewards: Vec<RewardNodeProvider>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct NetworkEconomics {
    pub neuron_minimum_stake_e8s: u64,
    pub max_proposals_to_keep_per_topic: u32,
    pub neuron_management_fee_per_proposal_e8s: u64,
    pub reject_cost_e8s: u64,
    pub transaction_fee_e8s: u64,
    pub neuron_spawn_dissolve_delay_seconds: u64,
    pub minimum_icp_xdr_rate: u64,
    pub maximum_node_provider_rewards_e8s: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct ApproveGenesisKyc {
    pub principals: Vec<Principal>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub enum Change {
    ToRemove(NodeProvider),
    ToAdd(NodeProvider),
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct AddOrRemoveNodeProvider {
    pub change: Option<Change>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct Motion {
    pub motion_text: String,
}

#[derive(Serialize, CandidType, Deserialize)]
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

#[derive(Serialize, CandidType, Deserialize)]
pub struct Proposal {
    pub url: String,
    pub title: Option<String>,
    pub action: Option<Action>,
    pub summary: String,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct MakingSnsProposal {
    pub proposal: Option<Box<Proposal>>,
    pub caller: Option<Principal>,
    pub proposer_id: Option<NeuronId>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct MostRecentMonthlyNodeProviderRewards {
    pub timestamp: u64,
    pub rewards: Vec<RewardNodeProvider>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct GovernanceCachedMetrics {
    pub total_maturity_e8s_equivalent: u64,
    pub not_dissolving_neurons_e8s_buckets: Vec<(u64, f64)>,
    pub dissolving_neurons_staked_maturity_e8s_equivalent_sum: u64,
    pub garbage_collectable_neurons_count: u64,
    pub dissolving_neurons_staked_maturity_e8s_equivalent_buckets: Vec<(u64, f64)>,
    pub neurons_with_invalid_stake_count: u64,
    pub not_dissolving_neurons_count_buckets: Vec<(u64, u64)>,
    pub total_supply_icp: u64,
    pub neurons_with_less_than_6_months_dissolve_delay_count: u64,
    pub dissolved_neurons_count: u64,
    pub community_fund_total_maturity_e8s_equivalent: u64,
    pub total_staked_e8s: u64,
    pub not_dissolving_neurons_count: u64,
    pub total_locked_e8s: u64,
    pub neurons_fund_total_active_neurons: u64,
    pub total_staked_maturity_e8s_equivalent: u64,
    pub not_dissolving_neurons_staked_maturity_e8s_equivalent_sum: u64,
    pub dissolved_neurons_e8s: u64,
    pub neurons_with_less_than_6_months_dissolve_delay_e8s: u64,
    pub not_dissolving_neurons_staked_maturity_e8s_equivalent_buckets: Vec<(u64, f64)>,
    pub dissolving_neurons_count_buckets: Vec<(u64, u64)>,
    pub dissolving_neurons_count: u64,
    pub dissolving_neurons_e8s_buckets: Vec<(u64, f64)>,
    pub community_fund_total_staked_e8s: u64,
    pub timestamp_seconds: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct RewardEvent {
    pub rounds_since_last_distribution: Option<u64>,
    pub day_after_genesis: u64,
    pub actual_timestamp_seconds: u64,
    pub total_available_e8s_equivalent: u64,
    pub latest_round_available_e8s_equivalent: Option<u64>,
    pub distributed_e8s_equivalent: u64,
    pub settled_proposals: Vec<NeuronId>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct NeuronStakeTransfer {
    pub to_subaccount: serde_bytes::ByteBuf,
    pub neuron_stake_e8s: u64,
    pub from: Option<Principal>,
    pub memo: u64,
    pub from_subaccount: serde_bytes::ByteBuf,
    pub transfer_timestamp: u64,
    pub block_height: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub enum Progress {
    LastNeuronId(NeuronId),
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct Migration {
    pub status: Option<i32>,
    pub failure_reason: Option<String>,
    pub progress: Option<Progress>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct Migrations {
    pub neuron_indexes_migration: Option<Migration>,
    pub copy_inactive_neurons_to_stable_memory_migration: Option<Migration>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct GovernanceError {
    pub error_message: String,
    pub error_type: i32,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct CfNeuron {
    pub nns_neuron_id: u64,
    pub amount_icp_e8s: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct CfParticipant {
    pub hotkey_principal: String,
    pub cf_neurons: Vec<CfNeuron>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct Ballot {
    pub vote: i32,
    pub voting_power: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct CanisterStatusResultV2 {
    pub status: Option<i32>,
    pub freezing_threshold: Option<u64>,
    pub controllers: Vec<Principal>,
    pub memory_size: Option<u64>,
    pub cycles: Option<u64>,
    pub idle_cycles_burned_per_day: Option<u64>,
    pub module_hash: serde_bytes::ByteBuf,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct CanisterSummary {
    pub status: Option<CanisterStatusResultV2>,
    pub canister_id: Option<Principal>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct SwapBackgroundInformation {
    pub ledger_index_canister_summary: Option<CanisterSummary>,
    pub fallback_controller_principal_ids: Vec<Principal>,
    pub ledger_archive_canister_summaries: Vec<CanisterSummary>,
    pub ledger_canister_summary: Option<CanisterSummary>,
    pub swap_canister_summary: Option<CanisterSummary>,
    pub governance_canister_summary: Option<CanisterSummary>,
    pub root_canister_summary: Option<CanisterSummary>,
    pub dapp_canister_summaries: Vec<CanisterSummary>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct DerivedProposalInformation {
    pub swap_background_information: Option<SwapBackgroundInformation>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct Tally {
    pub no: u64,
    pub yes: u64,
    pub total: u64,
    pub timestamp_seconds: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct WaitForQuietState {
    pub current_deadline_timestamp_seconds: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct ProposalData {
    pub id: Option<NeuronId>,
    pub failure_reason: Option<GovernanceError>,
    pub cf_participants: Vec<CfParticipant>,
    pub ballots: Vec<(u64, Ballot)>,
    pub proposal_timestamp_seconds: u64,
    pub reward_event_round: u64,
    pub failed_timestamp_seconds: u64,
    pub reject_cost_e8s: u64,
    pub derived_proposal_information: Option<DerivedProposalInformation>,
    pub latest_tally: Option<Tally>,
    pub sns_token_swap_lifecycle: Option<i32>,
    pub decided_timestamp_seconds: u64,
    pub proposal: Option<Box<Proposal>>,
    pub proposer: Option<NeuronId>,
    pub wait_for_quiet_state: Option<WaitForQuietState>,
    pub executed_timestamp_seconds: u64,
    pub original_total_community_fund_maturity_e8s_equivalent: Option<u64>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub enum Command2 {
    Spawn(NeuronId),
    Split(Split),
    Configure(Configure),
    Merge(Merge),
    DisburseToNeuron(DisburseToNeuron),
    SyncCommand(EmptyRecord),
    ClaimOrRefreshNeuron(ClaimOrRefresh),
    MergeMaturity(MergeMaturity),
    Disburse(Disburse),
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct NeuronInFlightCommand {
    pub command: Option<Command2>,
    pub timestamp: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct BallotInfo {
    pub vote: i32,
    pub proposal_id: Option<NeuronId>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub enum DissolveState {
    DissolveDelaySeconds(u64),
    WhenDissolvedTimestampSeconds(u64),
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct Neuron {
    pub id: Option<NeuronId>,
    pub staked_maturity_e8s_equivalent: Option<u64>,
    pub controller: Option<Principal>,
    pub recent_ballots: Vec<BallotInfo>,
    pub kyc_verified: bool,
    pub not_for_profit: bool,
    pub maturity_e8s_equivalent: u64,
    pub cached_neuron_stake_e8s: u64,
    pub created_timestamp_seconds: u64,
    pub auto_stake_maturity: Option<bool>,
    pub aging_since_timestamp_seconds: u64,
    pub hot_keys: Vec<Principal>,
    pub account: serde_bytes::ByteBuf,
    pub joined_community_fund_timestamp_seconds: Option<u64>,
    pub dissolve_state: Option<DissolveState>,
    pub followees: Vec<(i32, Followees)>,
    pub neuron_fees_e8s: u64,
    pub transfer: Option<NeuronStakeTransfer>,
    pub known_neuron_data: Option<KnownNeuronData>,
    pub spawn_at_timestamp_seconds: Option<u64>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct Governance {
    pub default_followees: Vec<(i32, Followees)>,
    pub making_sns_proposal: Option<MakingSnsProposal>,
    pub most_recent_monthly_node_provider_rewards: Option<MostRecentMonthlyNodeProviderRewards>,
    pub maturity_modulation_last_updated_at_timestamp_seconds: Option<u64>,
    pub wait_for_quiet_threshold_seconds: u64,
    pub metrics: Option<GovernanceCachedMetrics>,
    pub neuron_management_voting_period_seconds: Option<u64>,
    pub node_providers: Vec<NodeProvider>,
    pub cached_daily_maturity_modulation_basis_points: Option<i32>,
    pub economics: Option<NetworkEconomics>,
    pub spawning_neurons: Option<bool>,
    pub latest_reward_event: Option<RewardEvent>,
    pub to_claim_transfers: Vec<NeuronStakeTransfer>,
    pub short_voting_period_seconds: u64,
    pub migrations: Option<Migrations>,
    pub proposals: Vec<(u64, ProposalData)>,
    pub in_flight_commands: Vec<(u64, NeuronInFlightCommand)>,
    pub neurons: Vec<(u64, Neuron)>,
    pub genesis_timestamp_seconds: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub enum Result_ {
    Ok,
    Err(GovernanceError),
}

#[derive(Serialize, CandidType, Deserialize)]
pub enum Result1 {
    Error(GovernanceError),
    NeuronId(NeuronId),
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct ClaimOrRefreshNeuronFromAccountResponse {
    pub result: Option<Result1>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub enum Result2 {
    Ok(Neuron),
    Err(GovernanceError),
}

#[derive(Serialize, CandidType, Deserialize)]
pub enum Result3 {
    Ok(GovernanceCachedMetrics),
    Err(GovernanceError),
}

#[derive(Serialize, CandidType, Deserialize)]
pub enum Result4 {
    Ok(RewardNodeProviders),
    Err(GovernanceError),
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct NeuronInfo {
    pub dissolve_delay_seconds: u64,
    pub recent_ballots: Vec<BallotInfo>,
    pub created_timestamp_seconds: u64,
    pub state: i32,
    pub stake_e8s: u64,
    pub joined_community_fund_timestamp_seconds: Option<u64>,
    pub retrieved_at_timestamp_seconds: u64,
    pub known_neuron_data: Option<KnownNeuronData>,
    pub voting_power: u64,
    pub age_seconds: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub enum Result5 {
    Ok(NeuronInfo),
    Err(GovernanceError),
}

#[derive(Serialize, CandidType, Deserialize)]
pub enum Result6 {
    Ok(NodeProvider),
    Err(GovernanceError),
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct ProposalInfo {
    pub id: Option<NeuronId>,
    pub status: i32,
    pub topic: i32,
    pub failure_reason: Option<GovernanceError>,
    pub ballots: Vec<(u64, Ballot)>,
    pub proposal_timestamp_seconds: u64,
    pub reward_event_round: u64,
    pub deadline_timestamp_seconds: Option<u64>,
    pub failed_timestamp_seconds: u64,
    pub reject_cost_e8s: u64,
    pub derived_proposal_information: Option<DerivedProposalInformation>,
    pub latest_tally: Option<Tally>,
    pub reward_status: i32,
    pub decided_timestamp_seconds: u64,
    pub proposal: Option<Box<Proposal>>,
    pub proposer: Option<NeuronId>,
    pub executed_timestamp_seconds: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct ListKnownNeuronsResponse {
    pub known_neurons: Vec<KnownNeuron>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct ListNeurons {
    pub neuron_ids: Vec<u64>,
    pub include_neurons_readable_by_caller: bool,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct ListNeuronsResponse {
    pub neuron_infos: Vec<(u64, NeuronInfo)>,
    pub full_neurons: Vec<Neuron>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct ListNodeProvidersResponse {
    pub node_providers: Vec<NodeProvider>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct ListProposalInfo {
    pub include_reward_status: Vec<i32>,
    pub omit_large_fields: Option<bool>,
    pub before_proposal: Option<NeuronId>,
    pub limit: u32,
    pub exclude_topic: Vec<i32>,
    pub include_all_manage_neuron_proposals: Option<bool>,
    pub include_status: Vec<i32>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct ListProposalInfoResponse {
    pub proposal_info: Vec<ProposalInfo>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct SpawnResponse {
    pub created_neuron_id: Option<NeuronId>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct ClaimOrRefreshResponse {
    pub refreshed_neuron_id: Option<NeuronId>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct MergeResponse {
    pub target_neuron: Option<Neuron>,
    pub source_neuron: Option<Neuron>,
    pub target_neuron_info: Option<NeuronInfo>,
    pub source_neuron_info: Option<NeuronInfo>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct MakeProposalResponse {
    pub proposal_id: Option<NeuronId>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct StakeMaturityResponse {
    pub maturity_e8s: u64,
    pub staked_maturity_e8s: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct MergeMaturityResponse {
    pub merged_maturity_e8s: u64,
    pub new_stake_e8s: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct DisburseResponse {
    pub transfer_block_height: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub enum Command1 {
    Error(GovernanceError),
    Spawn(SpawnResponse),
    Split(SpawnResponse),
    Follow(EmptyRecord),
    ClaimOrRefresh(ClaimOrRefreshResponse),
    Configure(EmptyRecord),
    RegisterVote(EmptyRecord),
    Merge(MergeResponse),
    DisburseToNeuron(SpawnResponse),
    MakeProposal(MakeProposalResponse),
    StakeMaturity(StakeMaturityResponse),
    MergeMaturity(MergeMaturityResponse),
    Disburse(DisburseResponse),
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct ManageNeuronResponse {
    pub command: Option<Command1>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct Committed {
    pub total_direct_contribution_icp_e8s: Option<u64>,
    pub total_neurons_fund_contribution_icp_e8s: Option<u64>,
    pub sns_governance_canister_id: Option<Principal>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub enum Result7 {
    Committed(Committed),
    Aborted(EmptyRecord),
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct SettleCommunityFundParticipation {
    pub result: Option<Result7>,
    pub open_sns_token_swap_proposal_id: Option<u64>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct UpdateNodeProvider {
    pub reward_account: Option<AccountIdentifier>,
}
