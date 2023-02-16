#![cfg_attr(rustfmt, rustfmt_skip)]
#![allow(clippy::all)]
#![allow(clippy::missing_docs_in_private_items)]
#![allow(non_camel_case_types)]
#![allow(dead_code)]

use crate::types::{CandidType, Deserialize, Serialize};
use ic_cdk::api::call::CallResult;
// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
// use ic_cdk::export::candid::{self, CandidType, Deserialize, Serialize, Clone, Debug};
// use ic_cdk::api::call::CallResult;

#[derive(CandidType, Deserialize, Serialize, Clone, Debug, PartialEq)]
pub struct Init {
  pub  sns_root_canister_id: String,
  pub  fallback_controller_principal_ids: Vec<String>,
  pub  neuron_minimum_stake_e8s: Option<u64>,
  pub  nns_governance_canister_id: String,
  pub  transaction_fee_e8s: Option<u64>,
  pub  icp_ledger_canister_id: String,
  pub  sns_ledger_canister_id: String,
  pub  sns_governance_canister_id: String,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ErrorRefundIcpRequest { source_principal_id: Option<candid::Principal> }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Ok { block_height: Option<u64> }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Err { description: Option<String>, error_type: Option<i32> }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum Result { Ok(Ok), Err(Err) }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ErrorRefundIcpResponse { result: Option<Result> }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct finalize_swap_arg0 {}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GovernanceError { error_message: String, error_type: i32 }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Response { governance_error: Option<GovernanceError> }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CanisterCallError { code: Option<i32>, description: String }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum Possibility { Ok(Response), Err(CanisterCallError) }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SettleCommunityFundParticipationResult {
  pub  possibility: Option<Possibility>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct FailedUpdate {
  pub  err: Option<CanisterCallError>,
  pub  dapp_canister_id: Option<candid::Principal>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SetDappControllersResponse { failed_updates: Vec<FailedUpdate> }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum Possibility_1 { Ok(SetDappControllersResponse), Err(CanisterCallError) }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SetDappControllersCallResult { possibility: Option<Possibility_1> }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum Possibility_2 { Err(CanisterCallError) }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SetModeCallResult { possibility: Option<Possibility_2> }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SweepResult { failure: u32, skipped: u32, success: u32 }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct FinalizeSwapResponse {
  pub  settle_community_fund_participation_result: Option<
    SettleCommunityFundParticipationResult
  >,
  pub  error_message: Option<String>,
  pub  set_dapp_controllers_result: Option<SetDappControllersCallResult>,
  pub  sns_governance_normal_mode_enabled: Option<SetModeCallResult>,
  pub  sweep_icp: Option<SweepResult>,
  pub  sweep_sns: Option<SweepResult>,
  pub  create_neuron: Option<SweepResult>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GetBuyerStateRequest { principal_id: Option<candid::Principal> }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct TransferableAmount {
  pub  transfer_start_timestamp_seconds: u64,
  pub  amount_e8s: u64,
  pub  transfer_success_timestamp_seconds: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct BuyerState { icp: Option<TransferableAmount> }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GetBuyerStateResponse { buyer_state: Option<BuyerState> }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct get_buyers_total_arg0 {}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GetBuyersTotalResponse { buyers_total: u64 }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct get_canister_status_arg0 {}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum CanisterStatusType { stopped, stopping, running }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct DefiniteCanisterSettingsArgs {
  pub  controller: candid::Principal,
  pub  freezing_threshold: candid::Nat,
  pub  controllers: Vec<candid::Principal>,
  pub  memory_allocation: candid::Nat,
  pub  compute_allocation: candid::Nat,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CanisterStatusResultV2 {
  pub  controller: candid::Principal,
  pub  status: CanisterStatusType,
  pub  freezing_threshold: candid::Nat,
  pub  balance: Vec<(Vec<u8>,candid::Nat,)>,
  pub  memory_size: candid::Nat,
  pub  cycles: candid::Nat,
  pub  settings: DefiniteCanisterSettingsArgs,
  pub  idle_cycles_burned_per_day: candid::Nat,
  pub  module_hash: Option<Vec<u8>>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct get_derived_state_arg0 {}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GetDerivedStateResponse {
  pub  sns_tokens_per_icp: Option<f64>,
  pub  buyer_total_icp_e8s: Option<u64>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct get_init_arg0 {}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GetInitResponse { init: Option<Init> }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct get_lifecycle_arg0 {}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GetLifecycleResponse { lifecycle: Option<i32> }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct get_state_arg0 {}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct NeuronAttributes { dissolve_delay_seconds: u64, memo: u64 }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CfInvestment { hotkey_principal: String, nns_neuron_id: u64 }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct DirectInvestment { buyer_principal: String }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum Investor { CommunityFund(CfInvestment), Direct(DirectInvestment) }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SnsNeuronRecipe {
  pub  sns: Option<TransferableAmount>,
  pub  neuron_attributes: Option<NeuronAttributes>,
  pub  investor: Option<Investor>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CfNeuron { nns_neuron_id: u64, amount_icp_e8s: u64 }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CfParticipant { hotkey_principal: String, cf_neurons: Vec<CfNeuron> }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug, PartialEq)]
pub struct NeuronBasketConstructionParameters {
  pub  dissolve_delay_interval_seconds: u64,
  pub  count: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug, PartialEq)]
pub struct Params {
  pub  min_participant_icp_e8s: u64,
  pub  neuron_basket_construction_parameters: Option<
    NeuronBasketConstructionParameters
  >,
  pub  max_icp_e8s: u64,
  pub  swap_due_timestamp_seconds: u64,
  pub  min_participants: u32,
  pub  sns_token_e8s: u64,
  pub  max_participant_icp_e8s: u64,
  pub  min_icp_e8s: u64,
  pub sale_delay_seconds: Option<u64>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Swap {
  pub  neuron_recipes: Vec<SnsNeuronRecipe>,
  pub  finalize_swap_in_progress: Option<bool>,
  pub  cf_participants: Vec<CfParticipant>,
  pub  init: Option<Init>,
  pub  lifecycle: i32,
  pub  buyers: Vec<(String,BuyerState,)>,
  pub  params: Option<Params>,
  pub  open_sns_token_swap_proposal_id: Option<u64>,
  pub  decentralization_sale_open_timestamp_seconds: Option<u64>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct DerivedState { pub sns_tokens_per_icp: f32, pub buyer_total_icp_e8s: u64 }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug, Default)]
pub struct GetStateResponse { pub swap: Option<Swap>, pub derived: Option<DerivedState> }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct OpenRequest {
  pub  cf_participants: Vec<CfParticipant>,
  pub  params: Option<Params>,
  pub  open_sns_token_swap_proposal_id: Option<u64>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct open_ret0 {}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct RefreshBuyerTokensRequest { buyer: String }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct RefreshBuyerTokensResponse {
  pub  icp_accepted_participation_e8s: u64,
  pub  icp_ledger_account_balance_e8s: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct restore_dapp_controllers_arg0 {}

pub struct SERVICE(candid::Principal);
impl SERVICE{
  pub async fn error_refund_icp(
    &self,
    arg0: ErrorRefundIcpRequest,
  ) -> CallResult<(ErrorRefundIcpResponse,)> {
    ic_cdk::call(self.0, "error_refund_icp", (arg0,)).await
  }
  pub async fn finalize_swap(&self, arg0: finalize_swap_arg0) -> CallResult<
    (FinalizeSwapResponse,)
  > { ic_cdk::call(self.0, "finalize_swap", (arg0,)).await }
  pub async fn get_buyer_state(&self, arg0: GetBuyerStateRequest) -> CallResult<
    (GetBuyerStateResponse,)
  > { ic_cdk::call(self.0, "get_buyer_state", (arg0,)).await }
  pub async fn get_buyers_total(
    &self,
    arg0: get_buyers_total_arg0,
  ) -> CallResult<(GetBuyersTotalResponse,)> {
    ic_cdk::call(self.0, "get_buyers_total", (arg0,)).await
  }
  pub async fn get_canister_status(
    &self,
    arg0: get_canister_status_arg0,
  ) -> CallResult<(CanisterStatusResultV2,)> {
    ic_cdk::call(self.0, "get_canister_status", (arg0,)).await
  }
  pub async fn get_derived_state(
    &self,
    arg0: get_derived_state_arg0,
  ) -> CallResult<(GetDerivedStateResponse,)> {
    ic_cdk::call(self.0, "get_derived_state", (arg0,)).await
  }
  pub async fn get_init(&self, arg0: get_init_arg0) -> CallResult<
    (GetInitResponse,)
  > { ic_cdk::call(self.0, "get_init", (arg0,)).await }
  pub async fn get_lifecycle(&self, arg0: get_lifecycle_arg0) -> CallResult<
    (GetLifecycleResponse,)
  > { ic_cdk::call(self.0, "get_lifecycle", (arg0,)).await }
  pub async fn get_state(&self, arg0: get_state_arg0) -> CallResult<
    (GetStateResponse,)
  > { ic_cdk::call(self.0, "get_state", (arg0,)).await }
  pub async fn open(&self, arg0: OpenRequest) -> CallResult<(open_ret0,)> {
    ic_cdk::call(self.0, "open", (arg0,)).await
  }
  pub async fn refresh_buyer_tokens(
    &self,
    arg0: RefreshBuyerTokensRequest,
  ) -> CallResult<(RefreshBuyerTokensResponse,)> {
    ic_cdk::call(self.0, "refresh_buyer_tokens", (arg0,)).await
  }
  pub async fn restore_dapp_controllers(
    &self,
    arg0: restore_dapp_controllers_arg0,
  ) -> CallResult<(SetDappControllersCallResult,)> {
    ic_cdk::call(self.0, "restore_dapp_controllers", (arg0,)).await
  }
}
