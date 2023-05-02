//! Slowly changing information about an SNS
use crate::types::ic_sns_governance::{GetMetadataResponse, ListNervousSystemFunctionsResponse};
use crate::types::ic_sns_root::ListSnsCanistersResponse;
use crate::types::ic_sns_swap::{
    DerivedState, GetDerivedStateResponse, GetInitResponse, GetLifecycleResponse, GetSaleParametersResponse,
    GetStateResponse, Init, Params, Swap,
};
use crate::types::ic_sns_wasm::DeployedSns;
use crate::types::upstream::UpstreamData;
use crate::Icrc1Value;
use candid::{CandidType, Nat};
use num_traits::ToPrimitive;
use serde::{Deserialize, Serialize};

/// Information about an SNS that changes relatively slowly and that is common, i.e. not user specific.
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct SlowSnsData {
    /// Index in the nns-sns-wasms canister
    pub index: u64,
    /// Canister IDs from the nns-sns-wasm canister.
    pub canister_ids: DeployedSns,
    /// Canister IDs from the sns-root canister.
    pub list_sns_canisters: ListSnsCanistersResponse,
    /// Governance metadata such as token name and logo.
    pub meta: SlowMetadata,
    /// Governance parameters such as tokenomics.
    pub parameters: ListNervousSystemFunctionsResponse,
    /// Decentralisation state
    pub swap_state: SlowSwapState,
    /// Ledger metadata.  The ledger keeps track of who owns how many tokens.
    pub icrc1_metadata: Vec<(String, Icrc1Value)>,
    /// The ledger fee, presumably a transaction fee.
    /// TODO: Convert to u64 in v2 of the SNS aggregator
    pub icrc1_fee: Nat,
    /// The ledger total tokens supply
    pub icrc1_total_supply: u64,
    /// The swap params of the swap
    pub swap_params: Option<GetSaleParametersResponse>,
    /// The initialization params of the swap
    pub init: Option<GetInitResponse>,
    /// The derived state of the swap
    pub derived_state: Option<GetDerivedStateResponse>,
    /// The lifecycle of the swap
    pub lifecycle: Option<GetLifecycleResponse>,
}

impl From<&UpstreamData> for SlowSnsData {
    fn from(upstream: &UpstreamData) -> Self {
        SlowSnsData {
            index: upstream.index,
            canister_ids: upstream.canister_ids.clone(),
            list_sns_canisters: upstream.list_sns_canisters.clone(),
            meta: SlowMetadata::from(&upstream.meta),
            parameters: upstream.parameters.clone(),
            swap_state: SlowSwapState::from(&upstream.swap_state),
            icrc1_metadata: upstream.icrc1_metadata.clone(),
            icrc1_fee: upstream.icrc1_fee.clone(),
            // Fallback to 0 if conversion to u64 fails.
            icrc1_total_supply: upstream.icrc1_total_supply.0.to_u64().unwrap_or(0),
            swap_params: upstream.swap_params.clone(),
            init: upstream.init.clone(),
            derived_state: upstream.derived_state.clone(),
            lifecycle: upstream.lifecycle.clone(),
        }
    }
}

/// Response message for 'get_metadata'.
///
/// Note: Ideally this should not exist and any optimisations we make here can be pushed upstteam.
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug, PartialEq, Eq, serde::Serialize)]
pub struct SlowMetadata {
    /// Same as upstream.
    pub url: Option<String>,
    /// Same as upstream.
    pub name: Option<String>,
    /// Same as upstream.
    /// Note: The description can also be quite long and isn't needed for the initial view of all the SNSs
    pub description: Option<String>,
}

impl From<&GetMetadataResponse> for SlowMetadata {
    fn from(upstream: &GetMetadataResponse) -> Self {
        SlowMetadata {
            url: upstream.url.clone(),
            name: upstream.name.clone(),
            description: upstream.description.clone(),
        }
    }
}

/// The only supported image format
pub const LOGO_FMT: &str = "png";
/// The only supported logo data URL prefix
pub const LOGO_PREFIX: &str = "data:image/png;base64,";

/// Get the logo as binary from base64.
/// TODO: Maybe support more image types?
pub fn logo_binary(data_url: &str) -> Vec<u8> {
    base64::decode(data_url.strip_prefix(LOGO_PREFIX).unwrap_or_default()).unwrap_or_default()
}

/// Slowly changing information about an SNS canister's swap state.
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug, PartialEq, serde::Serialize)]
pub struct SlowSwapState {
    /// Slowly changing information extracted directly from an SNS canister.
    pub swap: Option<SlowSwap>,
    /// Slowly changing information deduced about a swap state.
    pub derived: Option<SlowDerivedState>,
}
impl From<&GetStateResponse> for SlowSwapState {
    fn from(upstream: &GetStateResponse) -> Self {
        SlowSwapState {
            swap: upstream.swap.as_ref().map(SlowSwap::from),
            derived: upstream.derived.as_ref().map(SlowDerivedState::from),
        }
    }
}

/// Slow information about an SNS extracted from its swap canister.
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug, PartialEq, serde::Serialize)]
pub struct SlowSwap {
    /// The current lifecycle of the swap.
    pub lifecycle: i32,
    /// Specified on creation. That is, always specified and immutable.
    pub init: Option<Init>,
    /// Specified in the transition from PENDING to OPEN and immutable
    /// thereafter.
    pub params: Option<Params>,
    /// When the swap is committed, this field is initialized according
    /// to the outcome of the swap.
    pub open_sns_token_swap_proposal_id: ::core::option::Option<u64>,
    /// The time at which the sale is expected to open.
    pub decentralization_sale_open_timestamp_seconds: Option<u64>,
}

impl From<&Swap> for SlowSwap {
    fn from(upstream: &Swap) -> Self {
        SlowSwap {
            lifecycle: upstream.lifecycle,
            init: upstream.init.clone(),
            params: upstream.params.clone(),
            open_sns_token_swap_proposal_id: upstream.open_sns_token_swap_proposal_id,
            decentralization_sale_open_timestamp_seconds: upstream.decentralization_sale_open_timestamp_seconds,
        }
    }
}

/// Slow informaton about an SNS extracted from its derived state.
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug, PartialEq, serde::Serialize)]
pub struct SlowDerivedState {
    /// Current approximate total ICP committed to an SNS.
    pub buyer_total_icp_e8s: u64,
    /// Current approximate rate SNS tokens per ICP.
    pub sns_tokens_per_icp: f32,
}

impl From<&DerivedState> for SlowDerivedState {
    fn from(upstream: &DerivedState) -> Self {
        SlowDerivedState {
            buyer_total_icp_e8s: upstream.buyer_total_icp_e8s,
            sns_tokens_per_icp: upstream.sns_tokens_per_icp,
        }
    }
}
