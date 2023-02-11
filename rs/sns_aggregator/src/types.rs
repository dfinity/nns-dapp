//! Types used by the aggregator

// Types generated from .did interface files
pub mod ic_sns_governance;
pub mod ic_sns_ledger;
pub mod ic_sns_root;
pub mod ic_sns_swap;
pub mod ic_sns_wasm;

// Other types
pub mod slow;
pub mod upstream;

// Re-export commonly used types to ensure that different versions of the same type are not used.
pub use ic_cdk::export::candid::{CandidType, Deserialize};
pub use ic_sns_governance::{GetMetadataResponse, ListNervousSystemFunctionsResponse};
pub use ic_sns_ledger::{Tokens as SnsTokens, Value as Icrc1Value};
pub use ic_sns_root::ListSnsCanistersResponse;
pub use ic_sns_swap::GetStateResponse;
pub use ic_sns_wasm::{DeployedSns, ListDeployedSnsesResponse, SnsCanisterIds};
pub use serde::Serialize;

/// A named empty record.
///
/// Many candid interfaces take an empty record as their argument.
/// Anonymous empty records are not handled correctly by didc, so we name them 'EmptyRecord'.
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct EmptyRecord {}
