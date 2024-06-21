//! Rust code created from candid by: `scripts/did2rs.sh --canister nns_governance --out api.rs --header did2rs.header --traits Serialize`
//! Candid for canister `nns_governance` obtained by `scripts/update_ic_commit` from: <https://raw.githubusercontent.com/dfinity/ic/release-2024-06-12_23-01-base/rs/nns/governance/canister/governance.did>
#![allow(clippy::all)]
#![allow(missing_docs)]
#![allow(clippy::missing_docs_in_private_items)]
#![allow(non_camel_case_types)]
#![allow(dead_code, unused_imports)]
use candid::{self, CandidType, Decode, Deserialize, Encode, Principal};
use ic_cdk::api::call::CallResult;
use serde::Serialize;

#[derive(Serialize, CandidType, Deserialize)]
pub struct EmptyRecord {}
// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
// #![allow(dead_code, unused_imports)]
// use candid::{self, CandidType, Deserialize, Principal};
// use ic_cdk::api::call::CallResult as Result;

#[derive(Serialize, CandidType, Deserialize)]
pub struct NeuronId {
    pub id: u64,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct GovernanceError {
    pub error_message: String,
    pub error_type: i32,
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
    pub neurons_fund_participation: Option<bool>,
    pub duration: Option<Duration>,
    pub neuron_basket_construction_parameters: Option<NeuronBasketConstructionParameters>,
    pub confirmation_text: Option<String>,
    pub maximum_participant_icp: Option<Tokens>,
    pub minimum_icp: Option<Tokens>,
    pub minimum_direct_participation_icp: Option<Tokens>,
    pub minimum_participant_icp: Option<Tokens>,
    pub start_time: Option<GlobalTimeOfDay>,
    pub maximum_direct_participation_icp: Option<Tokens>,
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
    pub min_direct_participation_icp_e8s: Option<u64>,
    pub min_icp_e8s: u64,
    pub max_direct_participation_icp_e8s: Option<u64>,
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
pub struct Followees {
    pub followees: Vec<NeuronId>,
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
pub struct Decimal {
    pub human_readable: Option<String>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct NeuronsFundMatchedFundingCurveCoefficients {
    pub contribution_threshold_xdr: Option<Decimal>,
    pub one_third_participation_milestone_xdr: Option<Decimal>,
    pub full_participation_milestone_xdr: Option<Decimal>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct NeuronsFundEconomics {
    pub maximum_icp_xdr_rate: Option<Percentage>,
    pub neurons_fund_matched_funding_curve_coefficients: Option<NeuronsFundMatchedFundingCurveCoefficients>,
    pub max_theoretical_neurons_fund_participation_amount_xdr: Option<Decimal>,
    pub minimum_icp_xdr_rate: Option<Percentage>,
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
    pub neurons_fund_economics: Option<NeuronsFundEconomics>,
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

pub struct Service(pub Principal);
impl Service {
    pub async fn get_proposal_info(&self, arg0: u64) -> CallResult<(Option<ProposalInfo>,)> {
        ic_cdk::call(self.0, "get_proposal_info", (arg0,)).await
    }
}
