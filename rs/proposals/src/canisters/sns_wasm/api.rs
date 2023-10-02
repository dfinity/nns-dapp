// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
#![allow(dead_code, unused_imports)]
use candid::{self, CandidType, Deserialize, Principal, Encode, Decode};
use ic_cdk::api::call::CallResult as Result;
use serde::Serialize;

#[derive(CandidType, Deserialize)]
pub struct SnsWasmCanisterInitPayload {
  allowed_principals: Vec<Principal>,
  access_controls_enabled: bool,
  sns_subnet_ids: Vec<Principal>,
}

#[derive(CandidType, Deserialize)]
pub struct SnsWasm { pub wasm: serde_bytes::ByteBuf, pub canister_type: i32 }

#[derive(CandidType, Deserialize)]
pub struct AddWasmRequest { pub hash: serde_bytes::ByteBuf, pub wasm: Option<SnsWasm> }

#[derive(CandidType, Deserialize)]
pub struct SnsWasmError { message: String }

#[derive(CandidType, Deserialize)]
pub enum Result_ { Error(SnsWasmError), Hash(serde_bytes::ByteBuf) }

#[derive(CandidType, Deserialize)]
pub struct AddWasmResponse { result: Option<Result_> }

#[derive(CandidType, Deserialize)]
pub struct NeuronBasketConstructionParameters {
  dissolve_delay_interval_seconds: u64,
  count: u64,
}

#[derive(CandidType, Deserialize)]
pub struct Canister { id: Option<Principal> }

#[derive(CandidType, Deserialize)]
pub struct DappCanisters { canisters: Vec<Canister> }

#[derive(CandidType, Deserialize)]
pub struct LinearScalingCoefficient {
  slope_numerator: Option<u64>,
  intercept_icp_e8s: Option<u64>,
  from_direct_participation_icp_e8s: Option<u64>,
  slope_denominator: Option<u64>,
  to_direct_participation_icp_e8s: Option<u64>,
}

#[derive(CandidType, Deserialize)]
pub struct NeuronsFundParticipationConstraints {
  coefficient_intervals: Vec<LinearScalingCoefficient>,
  max_neurons_fund_participation_icp_e8s: Option<u64>,
  min_direct_participation_threshold_icp_e8s: Option<u64>,
}

#[derive(CandidType, Deserialize)]
pub struct CfNeuron { nns_neuron_id: u64, amount_icp_e8s: u64 }

#[derive(CandidType, Deserialize)]
pub struct CfParticipant { hotkey_principal: String, cf_neurons: Vec<CfNeuron> }

#[derive(CandidType, Deserialize)]
pub struct NeuronsFundParticipants { participants: Vec<CfParticipant> }

#[derive(CandidType, Deserialize)]
pub struct TreasuryDistribution { total_e8s: u64 }

#[derive(CandidType, Deserialize)]
pub struct NeuronDistribution {
  controller: Option<Principal>,
  dissolve_delay_seconds: u64,
  memo: u64,
  stake_e8s: u64,
  vesting_period_seconds: Option<u64>,
}

#[derive(CandidType, Deserialize)]
pub struct DeveloperDistribution { developer_neurons: Vec<NeuronDistribution> }

#[derive(CandidType, Deserialize)]
pub struct AirdropDistribution { airdrop_neurons: Vec<NeuronDistribution> }

#[derive(CandidType, Deserialize)]
pub struct SwapDistribution { total_e8s: u64, initial_swap_amount_e8s: u64 }

#[derive(CandidType, Deserialize)]
pub struct FractionalDeveloperVotingPower {
  treasury_distribution: Option<TreasuryDistribution>,
  developer_distribution: Option<DeveloperDistribution>,
  airdrop_distribution: Option<AirdropDistribution>,
  swap_distribution: Option<SwapDistribution>,
}

#[derive(CandidType, Deserialize)]
pub enum InitialTokenDistribution {
  FractionalDeveloperVotingPower(FractionalDeveloperVotingPower),
}

#[derive(CandidType, Deserialize)]
pub struct Countries { iso_codes: Vec<String> }

#[derive(CandidType, Deserialize)]
pub struct SnsInitPayload {
  url: Option<String>,
  max_dissolve_delay_seconds: Option<u64>,
  max_dissolve_delay_bonus_percentage: Option<u64>,
  nns_proposal_id: Option<u64>,
  min_participant_icp_e8s: Option<u64>,
  neuron_basket_construction_parameters: Option<
    NeuronBasketConstructionParameters
  >,
  fallback_controller_principal_ids: Vec<String>,
  token_symbol: Option<String>,
  final_reward_rate_basis_points: Option<u64>,
  max_icp_e8s: Option<u64>,
  neuron_minimum_stake_e8s: Option<u64>,
  confirmation_text: Option<String>,
  logo: Option<String>,
  name: Option<String>,
  swap_start_timestamp_seconds: Option<u64>,
  swap_due_timestamp_seconds: Option<u64>,
  initial_voting_period_seconds: Option<u64>,
  neuron_minimum_dissolve_delay_to_vote_seconds: Option<u64>,
  description: Option<String>,
  max_neuron_age_seconds_for_age_bonus: Option<u64>,
  min_participants: Option<u64>,
  initial_reward_rate_basis_points: Option<u64>,
  wait_for_quiet_deadline_increase_seconds: Option<u64>,
  transaction_fee_e8s: Option<u64>,
  dapp_canisters: Option<DappCanisters>,
  neurons_fund_participation_constraints: Option<
    NeuronsFundParticipationConstraints
  >,
  neurons_fund_participants: Option<NeuronsFundParticipants>,
  max_age_bonus_percentage: Option<u64>,
  initial_token_distribution: Option<InitialTokenDistribution>,
  reward_rate_transition_duration_seconds: Option<u64>,
  token_logo: Option<String>,
  token_name: Option<String>,
  max_participant_icp_e8s: Option<u64>,
  proposal_reject_cost_e8s: Option<u64>,
  restricted_countries: Option<Countries>,
  min_icp_e8s: Option<u64>,
}

#[derive(CandidType, Deserialize)]
pub struct DeployNewSnsRequest { sns_init_payload: Option<SnsInitPayload> }

#[derive(CandidType, Deserialize)]
pub struct DappCanistersTransferResult {
  restored_dapp_canisters: Vec<Canister>,
  nns_controlled_dapp_canisters: Vec<Canister>,
  sns_controlled_dapp_canisters: Vec<Canister>,
}

#[derive(CandidType, Deserialize)]
pub struct SnsCanisterIds {
  root: Option<Principal>,
  swap: Option<Principal>,
  ledger: Option<Principal>,
  index: Option<Principal>,
  governance: Option<Principal>,
}

#[derive(CandidType, Deserialize)]
pub struct DeployNewSnsResponse {
  dapp_canisters_transfer_result: Option<DappCanistersTransferResult>,
  subnet_id: Option<Principal>,
  error: Option<SnsWasmError>,
  canisters: Option<SnsCanisterIds>,
}

#[derive(CandidType, Deserialize)]
pub struct GetAllowedPrincipalsArg {}

#[derive(CandidType, Deserialize)]
pub struct GetAllowedPrincipalsResponse { allowed_principals: Vec<Principal> }

#[derive(CandidType, Deserialize)]
pub struct SnsVersion {
  pub archive_wasm_hash: serde_bytes::ByteBuf,
  pub root_wasm_hash: serde_bytes::ByteBuf,
  pub swap_wasm_hash: serde_bytes::ByteBuf,
  pub ledger_wasm_hash: serde_bytes::ByteBuf,
  pub governance_wasm_hash: serde_bytes::ByteBuf,
  pub index_wasm_hash: serde_bytes::ByteBuf,
}

#[derive(CandidType, Deserialize)]
pub struct GetNextSnsVersionRequest {
  governance_canister_id: Option<Principal>,
  current_version: Option<SnsVersion>,
}

#[derive(CandidType, Deserialize)]
pub struct GetNextSnsVersionResponse { next_version: Option<SnsVersion> }

#[derive(CandidType, Deserialize)]
pub struct GetSnsSubnetIdsArg {}

#[derive(CandidType, Deserialize)]
pub struct GetSnsSubnetIdsResponse { sns_subnet_ids: Vec<Principal> }

#[derive(CandidType, Deserialize)]
pub struct GetWasmRequest { hash: serde_bytes::ByteBuf }

#[derive(CandidType, Deserialize)]
pub struct GetWasmResponse { wasm: Option<SnsWasm> }

#[derive(CandidType, Deserialize)]
pub struct SnsUpgrade {
  pub next_version: Option<SnsVersion>,
  pub current_version: Option<SnsVersion>,
}

#[derive(CandidType, Deserialize)]
pub struct InsertUpgradePathEntriesRequest {
  pub upgrade_path: Vec<SnsUpgrade>,
  pub sns_governance_canister_id: Option<Principal>,
}

#[derive(CandidType, Deserialize)]
pub struct InsertUpgradePathEntriesResponse { error: Option<SnsWasmError> }

#[derive(CandidType, Deserialize)]
pub struct ListDeployedSnsesArg {}

#[derive(CandidType, Deserialize)]
pub struct DeployedSns {
  root_canister_id: Option<Principal>,
  governance_canister_id: Option<Principal>,
  index_canister_id: Option<Principal>,
  swap_canister_id: Option<Principal>,
  ledger_canister_id: Option<Principal>,
}

#[derive(CandidType, Deserialize)]
pub struct ListDeployedSnsesResponse { instances: Vec<DeployedSns> }

#[derive(CandidType, Deserialize)]
pub struct ListUpgradeStepsRequest {
  limit: u32,
  starting_at: Option<SnsVersion>,
  sns_governance_canister_id: Option<Principal>,
}

#[derive(CandidType, Deserialize)]
pub struct PrettySnsVersion {
  archive_wasm_hash: String,
  root_wasm_hash: String,
  swap_wasm_hash: String,
  ledger_wasm_hash: String,
  governance_wasm_hash: String,
  index_wasm_hash: String,
}

#[derive(CandidType, Deserialize)]
pub struct ListUpgradeStep {
  pretty_version: Option<PrettySnsVersion>,
  version: Option<SnsVersion>,
}

#[derive(CandidType, Deserialize)]
pub struct ListUpgradeStepsResponse { steps: Vec<ListUpgradeStep> }

#[derive(CandidType, Deserialize, Serialize)]
pub struct UpdateAllowedPrincipalsRequest {
  added_principals: Vec<Principal>,
  removed_principals: Vec<Principal>,
}

#[derive(CandidType, Deserialize)]
pub enum UpdateAllowedPrincipalsResult {
  Error(SnsWasmError),
  AllowedPrincipals(GetAllowedPrincipalsResponse),
}

#[derive(CandidType, Deserialize)]
pub struct UpdateAllowedPrincipalsResponse {
  update_allowed_principals_result: Option<UpdateAllowedPrincipalsResult>,
}

#[derive(CandidType, Deserialize, Serialize)]
pub struct UpdateSnsSubnetListRequest {
  sns_subnet_ids_to_add: Vec<Principal>,
  sns_subnet_ids_to_remove: Vec<Principal>,
}

#[derive(CandidType, Deserialize)]
pub struct UpdateSnsSubnetListResponse { error: Option<SnsWasmError> }

pub struct Service(pub Principal);
impl Service {
  pub async fn add_wasm(&self, arg0: AddWasmRequest) -> Result<
    (AddWasmResponse,)
  > { ic_cdk::call(self.0, "add_wasm", (arg0,)).await }
  pub async fn deploy_new_sns(&self, arg0: DeployNewSnsRequest) -> Result<
    (DeployNewSnsResponse,)
  > { ic_cdk::call(self.0, "deploy_new_sns", (arg0,)).await }
  pub async fn get_allowed_principals(
    &self,
    arg0: GetAllowedPrincipalsArg,
  ) -> Result<(GetAllowedPrincipalsResponse,)> {
    ic_cdk::call(self.0, "get_allowed_principals", (arg0,)).await
  }
  pub async fn get_latest_sns_version_pretty(&self, arg0: ()) -> Result<
    (Vec<(String,String,)>,)
  > { ic_cdk::call(self.0, "get_latest_sns_version_pretty", (arg0,)).await }
  pub async fn get_next_sns_version(
    &self,
    arg0: GetNextSnsVersionRequest,
  ) -> Result<(GetNextSnsVersionResponse,)> {
    ic_cdk::call(self.0, "get_next_sns_version", (arg0,)).await
  }
  pub async fn get_sns_subnet_ids(&self, arg0: GetSnsSubnetIdsArg) -> Result<
    (GetSnsSubnetIdsResponse,)
  > { ic_cdk::call(self.0, "get_sns_subnet_ids", (arg0,)).await }
  pub async fn get_wasm(&self, arg0: GetWasmRequest) -> Result<
    (GetWasmResponse,)
  > { ic_cdk::call(self.0, "get_wasm", (arg0,)).await }
  pub async fn insert_upgrade_path_entries(
    &self,
    arg0: InsertUpgradePathEntriesRequest,
  ) -> Result<(InsertUpgradePathEntriesResponse,)> {
    ic_cdk::call(self.0, "insert_upgrade_path_entries", (arg0,)).await
  }
  pub async fn list_deployed_snses(&self, arg0: ListDeployedSnsesArg) -> Result<
    (ListDeployedSnsesResponse,)
  > { ic_cdk::call(self.0, "list_deployed_snses", (arg0,)).await }
  pub async fn list_upgrade_steps(
    &self,
    arg0: ListUpgradeStepsRequest,
  ) -> Result<(ListUpgradeStepsResponse,)> {
    ic_cdk::call(self.0, "list_upgrade_steps", (arg0,)).await
  }
  pub async fn update_allowed_principals(
    &self,
    arg0: UpdateAllowedPrincipalsRequest,
  ) -> Result<(UpdateAllowedPrincipalsResponse,)> {
    ic_cdk::call(self.0, "update_allowed_principals", (arg0,)).await
  }
  pub async fn update_sns_subnet_list(
    &self,
    arg0: UpdateSnsSubnetListRequest,
  ) -> Result<(UpdateSnsSubnetListResponse,)> {
    ic_cdk::call(self.0, "update_sns_subnet_list", (arg0,)).await
  }
}

