//! Rust code created from candid by: `scripts/did2rs.sh --canister sns_governance --out ic_sns_governance.rs --header did2rs.header --traits Serialize\,\ Clone\,\ Debug`
//! Candid for canister `sns_governance` obtained by `scripts/update_ic_commit` from: <https://raw.githubusercontent.com/dfinity/ic/release-2024-06-05_23-01-storage-layer-disabled/rs/sns/governance/canister/governance.did>
#![allow(clippy::all)]
#![allow(unused_imports)]
#![allow(missing_docs)]
#![allow(clippy::missing_docs_in_private_items)]
#![allow(non_camel_case_types)]
#![allow(dead_code)]

use crate::types::{CandidType, Deserialize, EmptyRecord, Serialize};
use candid::Principal;
use ic_cdk::api::call::CallResult;
// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
// #![allow(dead_code, unused_imports)]
// use candid::{self, CandidType, Deserialize, Principal};
// use ic_cdk::api::call::CallResult as Result;

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct GetMetadataArg {}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize, Default)]
pub struct GetMetadataResponse {
    pub url: Option<String>,
    pub logo: Option<String>,
    pub name: Option<String>,
    pub description: Option<String>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct GenericNervousSystemFunction {
    pub validator_canister_id: Option<Principal>,
    pub target_canister_id: Option<Principal>,
    pub validator_method_name: Option<String>,
    pub target_method_name: Option<String>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub enum FunctionType {
    NativeNervousSystemFunction(EmptyRecord),
    GenericNervousSystemFunction(GenericNervousSystemFunction),
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct NervousSystemFunction {
    pub id: u64,
    pub name: String,
    pub description: Option<String>,
    pub function_type: Option<FunctionType>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize, Default)]
pub struct ListNervousSystemFunctionsResponse {
    pub reserved_ids: Vec<u64>,
    pub functions: Vec<NervousSystemFunction>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Split {
    pub memo: u64,
    pub amount_e8s: u64,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct NeuronId {
    pub id: serde_bytes::ByteBuf,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Follow {
    pub function_id: u64,
    pub followees: Vec<NeuronId>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Subaccount {
    pub subaccount: serde_bytes::ByteBuf,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Account {
    pub owner: Option<Principal>,
    pub subaccount: Option<Subaccount>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct DisburseMaturity {
    pub to_account: Option<Account>,
    pub percentage_to_disburse: u32,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct MemoAndController {
    pub controller: Option<Principal>,
    pub memo: u64,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub enum By {
    MemoAndController(MemoAndController),
    NeuronId(EmptyRecord),
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct ClaimOrRefresh {
    pub by: Option<By>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct ChangeAutoStakeMaturity {
    pub requested_setting_for_auto_stake_maturity: bool,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct IncreaseDissolveDelay {
    pub additional_dissolve_delay_seconds: u32,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct SetDissolveTimestamp {
    pub dissolve_timestamp_seconds: u64,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub enum Operation {
    ChangeAutoStakeMaturity(ChangeAutoStakeMaturity),
    StopDissolving(EmptyRecord),
    StartDissolving(EmptyRecord),
    IncreaseDissolveDelay(IncreaseDissolveDelay),
    SetDissolveTimestamp(SetDissolveTimestamp),
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Configure {
    pub operation: Option<Operation>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct ProposalId {
    pub id: u64,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct RegisterVote {
    pub vote: i32,
    pub proposal: Option<ProposalId>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Followees {
    pub followees: Vec<NeuronId>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct DefaultFollowees {
    pub followees: Vec<(u64, Followees)>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct NeuronPermissionList {
    pub permissions: Vec<i32>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct VotingRewardsParameters {
    pub final_reward_rate_basis_points: Option<u64>,
    pub initial_reward_rate_basis_points: Option<u64>,
    pub reward_rate_transition_duration_seconds: Option<u64>,
    pub round_duration_seconds: Option<u64>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
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
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct ManageDappCanisterSettings {
    pub freezing_threshold: Option<u64>,
    pub canister_ids: Vec<Principal>,
    pub reserved_cycles_limit: Option<u64>,
    pub log_visibility: Option<i32>,
    pub wasm_memory_limit: Option<u64>,
    pub memory_allocation: Option<u64>,
    pub compute_allocation: Option<u64>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct RegisterDappCanisters {
    pub canister_ids: Vec<Principal>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct TransferSnsTreasuryFunds {
    pub from_treasury: i32,
    pub to_principal: Option<Principal>,
    pub to_subaccount: Option<Subaccount>,
    pub memo: Option<u64>,
    pub amount_e8s: u64,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct UpgradeSnsControlledCanister {
    pub new_canister_wasm: serde_bytes::ByteBuf,
    pub mode: Option<i32>,
    pub canister_id: Option<Principal>,
    pub canister_upgrade_arg: Option<serde_bytes::ByteBuf>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct DeregisterDappCanisters {
    pub canister_ids: Vec<Principal>,
    pub new_controllers: Vec<Principal>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct MintSnsTokens {
    pub to_principal: Option<Principal>,
    pub to_subaccount: Option<Subaccount>,
    pub memo: Option<u64>,
    pub amount_e8s: Option<u64>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct ManageSnsMetadata {
    pub url: Option<String>,
    pub logo: Option<String>,
    pub name: Option<String>,
    pub description: Option<String>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct ExecuteGenericNervousSystemFunction {
    pub function_id: u64,
    pub payload: serde_bytes::ByteBuf,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct ManageLedgerParameters {
    pub token_symbol: Option<String>,
    pub transfer_fee: Option<u64>,
    pub token_logo: Option<String>,
    pub token_name: Option<String>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Motion {
    pub motion_text: String,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub enum Action {
    ManageNervousSystemParameters(NervousSystemParameters),
    AddGenericNervousSystemFunction(NervousSystemFunction),
    ManageDappCanisterSettings(ManageDappCanisterSettings),
    RemoveGenericNervousSystemFunction(u64),
    UpgradeSnsToNextVersion(EmptyRecord),
    RegisterDappCanisters(RegisterDappCanisters),
    TransferSnsTreasuryFunds(TransferSnsTreasuryFunds),
    UpgradeSnsControlledCanister(UpgradeSnsControlledCanister),
    DeregisterDappCanisters(DeregisterDappCanisters),
    MintSnsTokens(MintSnsTokens),
    Unspecified(EmptyRecord),
    ManageSnsMetadata(ManageSnsMetadata),
    ExecuteGenericNervousSystemFunction(ExecuteGenericNervousSystemFunction),
    ManageLedgerParameters(ManageLedgerParameters),
    Motion(Motion),
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Proposal {
    pub url: String,
    pub title: String,
    pub action: Option<Action>,
    pub summary: String,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct StakeMaturity {
    pub percentage_to_stake: Option<u32>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct RemoveNeuronPermissions {
    pub permissions_to_remove: Option<NeuronPermissionList>,
    pub principal_id: Option<Principal>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct AddNeuronPermissions {
    pub permissions_to_add: Option<NeuronPermissionList>,
    pub principal_id: Option<Principal>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct MergeMaturity {
    pub percentage_to_merge: u32,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Amount {
    pub e8s: u64,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Disburse {
    pub to_account: Option<Account>,
    pub amount: Option<Amount>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
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
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct ManageNeuron {
    pub subaccount: serde_bytes::ByteBuf,
    pub command: Option<Command>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct GovernanceError {
    pub error_message: String,
    pub error_type: i32,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct SplitResponse {
    pub created_neuron_id: Option<NeuronId>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct DisburseMaturityResponse {
    pub amount_disbursed_e8s: u64,
    pub amount_deducted_e8s: Option<u64>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct ClaimOrRefreshResponse {
    pub refreshed_neuron_id: Option<NeuronId>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct GetProposal {
    pub proposal_id: Option<ProposalId>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct StakeMaturityResponse {
    pub maturity_e8s: u64,
    pub staked_maturity_e8s: u64,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct MergeMaturityResponse {
    pub merged_maturity_e8s: u64,
    pub new_stake_e8s: u64,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct DisburseResponse {
    pub transfer_block_height: u64,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub enum Command1 {
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
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct ManageNeuronResponse {
    pub command: Option<Command1>,
}

pub struct Service(pub Principal);
impl Service {
    pub async fn get_metadata(&self, arg0: GetMetadataArg) -> CallResult<(GetMetadataResponse,)> {
        ic_cdk::call(self.0, "get_metadata", (arg0,)).await
    }
    pub async fn list_nervous_system_functions(&self) -> CallResult<(ListNervousSystemFunctionsResponse,)> {
        ic_cdk::call(self.0, "list_nervous_system_functions", ()).await
    }
    pub async fn manage_neuron(&self, arg0: ManageNeuron) -> CallResult<(ManageNeuronResponse,)> {
        ic_cdk::call(self.0, "manage_neuron", (arg0,)).await
    }
}
