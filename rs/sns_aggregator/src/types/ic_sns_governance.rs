#![allow(clippy::all)]
#![allow(unused_imports)]
#![allow(clippy::missing_docs_in_private_items)]
#![allow(non_camel_case_types)]
#![allow(dead_code)]

use crate::types::{CandidType, Deserialize, EmptyRecord, Serialize};
use ic_cdk::api::call::CallResult;
// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
// use candid::{self, CandidType, Deserialize, Serialize, Clone, Debug, candid::Principal};
// use ic_cdk::api::call::CallResult as Result;

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GenericNervousSystemFunction {
    pub validator_canister_id: Option<candid::Principal>,
    pub target_canister_id: Option<candid::Principal>,
    pub validator_method_name: Option<String>,
    pub target_method_name: Option<String>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum FunctionType {
    NativeNervousSystemFunction(EmptyRecord),
    GenericNervousSystemFunction(GenericNervousSystemFunction),
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct NervousSystemFunction {
    pub id: u64,
    pub name: String,
    pub description: Option<String>,
    pub function_type: Option<FunctionType>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GovernanceCachedMetrics {
    pub not_dissolving_neurons_e8s_buckets: Vec<(u64, f64)>,
    pub garbage_collectable_neurons_count: u64,
    pub neurons_with_invalid_stake_count: u64,
    pub not_dissolving_neurons_count_buckets: Vec<(u64, u64)>,
    pub neurons_with_less_than_6_months_dissolve_delay_count: u64,
    pub dissolved_neurons_count: u64,
    pub total_staked_e8s: u64,
    pub total_supply_governance_tokens: u64,
    pub not_dissolving_neurons_count: u64,
    pub dissolved_neurons_e8s: u64,
    pub neurons_with_less_than_6_months_dissolve_delay_e8s: u64,
    pub dissolving_neurons_count_buckets: Vec<(u64, u64)>,
    pub dissolving_neurons_count: u64,
    pub dissolving_neurons_e8s_buckets: Vec<(u64, f64)>,
    pub timestamp_seconds: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct MaturityModulation {
    pub current_basis_points: Option<i32>,
    pub updated_at_timestamp_seconds: Option<u64>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct NeuronId {
    pub id: serde_bytes::ByteBuf,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Followees {
    pub followees: Vec<NeuronId>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct DefaultFollowees {
    pub followees: Vec<(u64, Followees)>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct NeuronPermissionList {
    pub permissions: Vec<i32>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct VotingRewardsParameters {
    pub final_reward_rate_basis_points: Option<u64>,
    pub initial_reward_rate_basis_points: Option<u64>,
    pub reward_rate_transition_duration_seconds: Option<u64>,
    pub round_duration_seconds: Option<u64>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct NervousSystemParameters {
    pub default_followees: Option<DefaultFollowees>,
    pub max_dissolve_delay_seconds: Option<u64>,
    pub max_dissolve_delay_bonus_percentage: Option<u64>,
    pub max_followees_per_function: Option<u64>,
    pub neuron_claimer_permissions: Option<NeuronPermissionList>,
    pub neuron_minimum_stake_e8s: Option<u64>,
    pub max_neuron_age_for_age_bonus: Option<u64>,
    pub initial_voting_period_seconds: Option<u64>,
    pub neuron_minimum_dissolve_delay_to_vote_seconds: Option<u64>,
    pub reject_cost_e8s: Option<u64>,
    pub max_proposals_to_keep_per_action: Option<u32>,
    pub wait_for_quiet_deadline_increase_seconds: Option<u64>,
    pub max_number_of_neurons: Option<u64>,
    pub transaction_fee_e8s: Option<u64>,
    pub max_number_of_proposals_with_ballots: Option<u64>,
    pub max_age_bonus_percentage: Option<u64>,
    pub neuron_grantable_permissions: Option<NeuronPermissionList>,
    pub voting_rewards_parameters: Option<VotingRewardsParameters>,
    pub maturity_modulation_disabled: Option<bool>,
    pub max_number_of_principals_per_neuron: Option<u64>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Version {
    pub archive_wasm_hash: serde_bytes::ByteBuf,
    pub root_wasm_hash: serde_bytes::ByteBuf,
    pub swap_wasm_hash: serde_bytes::ByteBuf,
    pub ledger_wasm_hash: serde_bytes::ByteBuf,
    pub governance_wasm_hash: serde_bytes::ByteBuf,
    pub index_wasm_hash: serde_bytes::ByteBuf,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ProposalId {
    pub id: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct RewardEvent {
    pub rounds_since_last_distribution: Option<u64>,
    pub actual_timestamp_seconds: u64,
    pub end_timestamp_seconds: Option<u64>,
    pub distributed_e8s_equivalent: u64,
    pub round: u64,
    pub settled_proposals: Vec<ProposalId>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct UpgradeInProgress {
    pub mark_failed_at_seconds: u64,
    pub checking_upgrade_lock: u64,
    pub proposal_id: u64,
    pub target_version: Option<Version>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GovernanceError {
    pub error_message: String,
    pub error_type: i32,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Ballot {
    pub vote: i32,
    pub cast_timestamp_seconds: u64,
    pub voting_power: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Tally {
    pub no: u64,
    pub yes: u64,
    pub total: u64,
    pub timestamp_seconds: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct RegisterDappCanisters {
    pub canister_ids: Vec<candid::Principal>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Subaccount {
    pub subaccount: serde_bytes::ByteBuf,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct TransferSnsTreasuryFunds {
    pub from_treasury: i32,
    pub to_principal: Option<candid::Principal>,
    pub to_subaccount: Option<Subaccount>,
    pub memo: Option<u64>,
    pub amount_e8s: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct UpgradeSnsControlledCanister {
    pub new_canister_wasm: serde_bytes::ByteBuf,
    pub mode: Option<i32>,
    pub canister_id: Option<candid::Principal>,
    pub canister_upgrade_arg: Option<serde_bytes::ByteBuf>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct DeregisterDappCanisters {
    pub canister_ids: Vec<candid::Principal>,
    pub new_controllers: Vec<candid::Principal>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ManageSnsMetadata {
    pub url: Option<String>,
    pub logo: Option<String>,
    pub name: Option<String>,
    pub description: Option<String>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ExecuteGenericNervousSystemFunction {
    pub function_id: u64,
    pub payload: serde_bytes::ByteBuf,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Motion {
    pub motion_text: String,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum Action {
    ManageNervousSystemParameters(NervousSystemParameters),
    AddGenericNervousSystemFunction(NervousSystemFunction),
    RemoveGenericNervousSystemFunction(u64),
    UpgradeSnsToNextVersion(EmptyRecord),
    RegisterDappCanisters(RegisterDappCanisters),
    TransferSnsTreasuryFunds(TransferSnsTreasuryFunds),
    UpgradeSnsControlledCanister(UpgradeSnsControlledCanister),
    DeregisterDappCanisters(DeregisterDappCanisters),
    Unspecified(EmptyRecord),
    ManageSnsMetadata(ManageSnsMetadata),
    ExecuteGenericNervousSystemFunction(ExecuteGenericNervousSystemFunction),
    Motion(Motion),
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Proposal {
    pub url: String,
    pub title: String,
    pub action: Option<Action>,
    pub summary: String,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct WaitForQuietState {
    pub current_deadline_timestamp_seconds: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ProposalData {
    pub id: Option<ProposalId>,
    pub payload_text_rendering: Option<String>,
    pub action: u64,
    pub failure_reason: Option<GovernanceError>,
    pub ballots: Vec<(String, Ballot)>,
    pub reward_event_round: u64,
    pub failed_timestamp_seconds: u64,
    pub reward_event_end_timestamp_seconds: Option<u64>,
    pub proposal_creation_timestamp_seconds: u64,
    pub initial_voting_period_seconds: u64,
    pub reject_cost_e8s: u64,
    pub latest_tally: Option<Tally>,
    pub wait_for_quiet_deadline_increase_seconds: u64,
    pub decided_timestamp_seconds: u64,
    pub proposal: Option<Proposal>,
    pub proposer: Option<NeuronId>,
    pub wait_for_quiet_state: Option<WaitForQuietState>,
    pub is_eligible_for_rewards: bool,
    pub executed_timestamp_seconds: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Split {
    pub memo: u64,
    pub amount_e8s: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Follow {
    pub function_id: u64,
    pub followees: Vec<NeuronId>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Account {
    pub owner: Option<candid::Principal>,
    pub subaccount: Option<Subaccount>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct DisburseMaturity {
    pub to_account: Option<Account>,
    pub percentage_to_disburse: u32,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ChangeAutoStakeMaturity {
    pub requested_setting_for_auto_stake_maturity: bool,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct IncreaseDissolveDelay {
    pub additional_dissolve_delay_seconds: u32,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SetDissolveTimestamp {
    pub dissolve_timestamp_seconds: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum Operation {
    ChangeAutoStakeMaturity(ChangeAutoStakeMaturity),
    StopDissolving(EmptyRecord),
    StartDissolving(EmptyRecord),
    IncreaseDissolveDelay(IncreaseDissolveDelay),
    SetDissolveTimestamp(SetDissolveTimestamp),
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Configure {
    pub operation: Option<Operation>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct RegisterVote {
    pub vote: i32,
    pub proposal: Option<ProposalId>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct FinalizeDisburseMaturity {
    pub amount_to_be_disbursed_e8s: u64,
    pub to_account: Option<Account>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct MemoAndController {
    pub controller: Option<candid::Principal>,
    pub memo: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum By {
    MemoAndController(MemoAndController),
    NeuronId(EmptyRecord),
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ClaimOrRefresh {
    pub by: Option<By>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct RemoveNeuronPermissions {
    pub permissions_to_remove: Option<NeuronPermissionList>,
    pub principal_id: Option<candid::Principal>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct AddNeuronPermissions {
    pub permissions_to_add: Option<NeuronPermissionList>,
    pub principal_id: Option<candid::Principal>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct MergeMaturity {
    pub percentage_to_merge: u32,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Amount {
    pub e8s: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Disburse {
    pub to_account: Option<Account>,
    pub amount: Option<Amount>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum Command_2 {
    Split(Split),
    Follow(Follow),
    DisburseMaturity(DisburseMaturity),
    Configure(Configure),
    RegisterVote(RegisterVote),
    SyncCommand(EmptyRecord),
    MakeProposal(Proposal),
    FinalizeDisburseMaturity(FinalizeDisburseMaturity),
    ClaimOrRefreshNeuron(ClaimOrRefresh),
    RemoveNeuronPermissions(RemoveNeuronPermissions),
    AddNeuronPermissions(AddNeuronPermissions),
    MergeMaturity(MergeMaturity),
    Disburse(Disburse),
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct NeuronInFlightCommand {
    pub command: Option<Command_2>,
    pub timestamp: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct NeuronPermission {
    pub principal: Option<candid::Principal>,
    pub permission_type: Vec<i32>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum DissolveState {
    DissolveDelaySeconds(u64),
    WhenDissolvedTimestampSeconds(u64),
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct DisburseMaturityInProgress {
    pub timestamp_of_disbursement_seconds: u64,
    pub amount_e8s: u64,
    pub account_to_disburse_to: Option<Account>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Neuron {
    pub id: Option<NeuronId>,
    pub staked_maturity_e8s_equivalent: Option<u64>,
    pub permissions: Vec<NeuronPermission>,
    pub maturity_e8s_equivalent: u64,
    pub cached_neuron_stake_e8s: u64,
    pub created_timestamp_seconds: u64,
    pub source_nns_neuron_id: Option<u64>,
    pub auto_stake_maturity: Option<bool>,
    pub aging_since_timestamp_seconds: u64,
    pub dissolve_state: Option<DissolveState>,
    pub voting_power_percentage_multiplier: u64,
    pub vesting_period_seconds: Option<u64>,
    pub disburse_maturity_in_progress: Vec<DisburseMaturityInProgress>,
    pub followees: Vec<(u64, Followees)>,
    pub neuron_fees_e8s: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Governance {
    pub root_canister_id: Option<candid::Principal>,
    pub id_to_nervous_system_functions: Vec<(u64, NervousSystemFunction)>,
    pub metrics: Option<GovernanceCachedMetrics>,
    pub maturity_modulation: Option<MaturityModulation>,
    pub mode: i32,
    pub parameters: Option<NervousSystemParameters>,
    pub is_finalizing_disburse_maturity: Option<bool>,
    pub deployed_version: Option<Version>,
    pub sns_initialization_parameters: String,
    pub latest_reward_event: Option<RewardEvent>,
    pub pending_version: Option<UpgradeInProgress>,
    pub swap_canister_id: Option<candid::Principal>,
    pub ledger_canister_id: Option<candid::Principal>,
    pub proposals: Vec<(u64, ProposalData)>,
    pub in_flight_commands: Vec<(String, NeuronInFlightCommand)>,
    pub sns_metadata: Option<ManageSnsMetadata>,
    pub neurons: Vec<(String, Neuron)>,
    pub genesis_timestamp_seconds: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct NeuronParameters {
    pub controller: Option<candid::Principal>,
    pub dissolve_delay_seconds: Option<u64>,
    pub source_nns_neuron_id: Option<u64>,
    pub stake_e8s: Option<u64>,
    pub followees: Vec<NeuronId>,
    pub hotkey: Option<candid::Principal>,
    pub neuron_id: Option<NeuronId>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ClaimSwapNeuronsRequest {
    pub neuron_parameters: Vec<NeuronParameters>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SwapNeuron {
    pub id: Option<NeuronId>,
    pub status: i32,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ClaimedSwapNeurons {
    pub swap_neurons: Vec<SwapNeuron>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum ClaimSwapNeuronsResult {
    Ok(ClaimedSwapNeurons),
    Err(i32),
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ClaimSwapNeuronsResponse {
    pub claim_swap_neurons_result: Option<ClaimSwapNeuronsResult>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct fail_stuck_upgrade_in_progress_arg0 {}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct fail_stuck_upgrade_in_progress_ret0 {}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct get_maturity_modulation_arg0 {}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GetMaturityModulationResponse {
    pub maturity_modulation: Option<MaturityModulation>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct get_metadata_arg0 {}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug, Default)]
pub struct GetMetadataResponse {
    pub url: Option<String>,
    pub logo: Option<String>,
    pub name: Option<String>,
    pub description: Option<String>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct get_mode_arg0 {}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GetModeResponse {
    pub mode: Option<i32>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GetNeuron {
    pub neuron_id: Option<NeuronId>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum Result {
    Error(GovernanceError),
    Neuron(Neuron),
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GetNeuronResponse {
    pub result: Option<Result>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GetProposal {
    pub proposal_id: Option<ProposalId>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum Result_1 {
    Error(GovernanceError),
    Proposal(ProposalData),
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GetProposalResponse {
    pub result: Option<Result_1>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum CanisterStatusType {
    stopped,
    stopping,
    running,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct DefiniteCanisterSettingsArgs {
    pub controller: candid::Principal,
    pub freezing_threshold: candid::Nat,
    pub controllers: Vec<candid::Principal>,
    pub memory_allocation: candid::Nat,
    pub compute_allocation: candid::Nat,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CanisterStatusResultV2 {
    pub controller: candid::Principal,
    pub status: CanisterStatusType,
    pub freezing_threshold: candid::Nat,
    pub balance: Vec<(serde_bytes::ByteBuf, candid::Nat)>,
    pub memory_size: candid::Nat,
    pub cycles: candid::Nat,
    pub settings: DefiniteCanisterSettingsArgs,
    pub idle_cycles_burned_per_day: candid::Nat,
    pub module_hash: Option<serde_bytes::ByteBuf>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct get_running_sns_version_arg0 {}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GetRunningSnsVersionResponse {
    pub deployed_version: Option<Version>,
    pub pending_version: Option<UpgradeInProgress>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct get_sns_initialization_parameters_arg0 {}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GetSnsInitializationParametersResponse {
    pub sns_initialization_parameters: String,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug, Default)]
pub struct ListNervousSystemFunctionsResponse {
    pub reserved_ids: Vec<u64>,
    pub functions: Vec<NervousSystemFunction>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ListNeurons {
    pub of_principal: Option<candid::Principal>,
    pub limit: u32,
    pub start_page_at: Option<NeuronId>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ListNeuronsResponse {
    pub neurons: Vec<Neuron>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ListProposals {
    pub include_reward_status: Vec<i32>,
    pub before_proposal: Option<ProposalId>,
    pub limit: u32,
    pub exclude_type: Vec<u64>,
    pub include_status: Vec<i32>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ListProposalsResponse {
    pub proposals: Vec<ProposalData>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct StakeMaturity {
    pub percentage_to_stake: Option<u32>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum Command {
    Split(Split),
    Follow(Follow),
    DisburseMaturity(DisburseMaturity),
    ClaimOrRefresh(ClaimOrRefresh),
    Configure(Configure),
    RegisterVote(RegisterVote),
    MakeProposal(Proposal),
    StakeMaturity(StakeMaturity),
    RemoveNeuronPermissions(RemoveNeuronPermissions),
    AddNeuronPermissions(AddNeuronPermissions),
    MergeMaturity(MergeMaturity),
    Disburse(Disburse),
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ManageNeuron {
    pub subaccount: serde_bytes::ByteBuf,
    pub command: Option<Command>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SplitResponse {
    pub created_neuron_id: Option<NeuronId>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct DisburseMaturityResponse {
    pub amount_disbursed_e8s: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ClaimOrRefreshResponse {
    pub refreshed_neuron_id: Option<NeuronId>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct StakeMaturityResponse {
    pub maturity_e8s: u64,
    pub staked_maturity_e8s: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct MergeMaturityResponse {
    pub merged_maturity_e8s: u64,
    pub new_stake_e8s: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct DisburseResponse {
    pub transfer_block_height: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum Command_1 {
    Error(GovernanceError),
    Split(SplitResponse),
    Follow(EmptyRecord),
    DisburseMaturity(DisburseMaturityResponse),
    ClaimOrRefresh(ClaimOrRefreshResponse),
    Configure(EmptyRecord),
    RegisterVote(EmptyRecord),
    MakeProposal(GetProposal),
    RemoveNeuronPermission(EmptyRecord),
    StakeMaturity(StakeMaturityResponse),
    MergeMaturity(MergeMaturityResponse),
    Disburse(DisburseResponse),
    AddNeuronPermission(EmptyRecord),
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ManageNeuronResponse {
    pub command: Option<Command_1>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SetMode {
    pub mode: i32,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct set_mode_ret0 {}

pub struct SERVICE(pub candid::Principal);
impl SERVICE {
    pub async fn claim_swap_neurons(&self, arg0: ClaimSwapNeuronsRequest) -> CallResult<(ClaimSwapNeuronsResponse,)> {
        ic_cdk::call(self.0, "claim_swap_neurons", (arg0,)).await
    }
    pub async fn fail_stuck_upgrade_in_progress(
        &self,
        arg0: fail_stuck_upgrade_in_progress_arg0,
    ) -> CallResult<(fail_stuck_upgrade_in_progress_ret0,)> {
        ic_cdk::call(self.0, "fail_stuck_upgrade_in_progress", (arg0,)).await
    }
    pub async fn get_build_metadata(&self) -> CallResult<(String,)> {
        ic_cdk::call(self.0, "get_build_metadata", ()).await
    }
    pub async fn get_latest_reward_event(&self) -> CallResult<(RewardEvent,)> {
        ic_cdk::call(self.0, "get_latest_reward_event", ()).await
    }
    pub async fn get_maturity_modulation(
        &self,
        arg0: get_maturity_modulation_arg0,
    ) -> CallResult<(GetMaturityModulationResponse,)> {
        ic_cdk::call(self.0, "get_maturity_modulation", (arg0,)).await
    }
    pub async fn get_metadata(&self, arg0: get_metadata_arg0) -> CallResult<(GetMetadataResponse,)> {
        ic_cdk::call(self.0, "get_metadata", (arg0,)).await
    }
    pub async fn get_mode(&self, arg0: get_mode_arg0) -> CallResult<(GetModeResponse,)> {
        ic_cdk::call(self.0, "get_mode", (arg0,)).await
    }
    pub async fn get_nervous_system_parameters(&self, arg0: ()) -> CallResult<(NervousSystemParameters,)> {
        ic_cdk::call(self.0, "get_nervous_system_parameters", (arg0,)).await
    }
    pub async fn get_neuron(&self, arg0: GetNeuron) -> CallResult<(GetNeuronResponse,)> {
        ic_cdk::call(self.0, "get_neuron", (arg0,)).await
    }
    pub async fn get_proposal(&self, arg0: GetProposal) -> CallResult<(GetProposalResponse,)> {
        ic_cdk::call(self.0, "get_proposal", (arg0,)).await
    }
    pub async fn get_root_canister_status(&self, arg0: ()) -> CallResult<(CanisterStatusResultV2,)> {
        ic_cdk::call(self.0, "get_root_canister_status", (arg0,)).await
    }
    pub async fn get_running_sns_version(
        &self,
        arg0: get_running_sns_version_arg0,
    ) -> CallResult<(GetRunningSnsVersionResponse,)> {
        ic_cdk::call(self.0, "get_running_sns_version", (arg0,)).await
    }
    pub async fn get_sns_initialization_parameters(
        &self,
        arg0: get_sns_initialization_parameters_arg0,
    ) -> CallResult<(GetSnsInitializationParametersResponse,)> {
        ic_cdk::call(self.0, "get_sns_initialization_parameters", (arg0,)).await
    }
    pub async fn list_nervous_system_functions(&self) -> CallResult<(ListNervousSystemFunctionsResponse,)> {
        ic_cdk::call(self.0, "list_nervous_system_functions", ()).await
    }
    pub async fn list_neurons(&self, arg0: ListNeurons) -> CallResult<(ListNeuronsResponse,)> {
        ic_cdk::call(self.0, "list_neurons", (arg0,)).await
    }
    pub async fn list_proposals(&self, arg0: ListProposals) -> CallResult<(ListProposalsResponse,)> {
        ic_cdk::call(self.0, "list_proposals", (arg0,)).await
    }
    pub async fn manage_neuron(&self, arg0: ManageNeuron) -> CallResult<(ManageNeuronResponse,)> {
        ic_cdk::call(self.0, "manage_neuron", (arg0,)).await
    }
    pub async fn set_mode(&self, arg0: SetMode) -> CallResult<(set_mode_ret0,)> {
        ic_cdk::call(self.0, "set_mode", (arg0,)).await
    }
}
