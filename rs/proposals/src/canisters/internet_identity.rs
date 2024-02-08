//! Types taken from the Internet Identity
//! 
//! * Types used to decode argument payload of NNS function type 4 for II upgrades
//!   Source: https://github.com/dfinity/internet-identity/blob/main/src/internet_identity_interface/src/lib.rs#L174
//!   Note: The link above lacks versioning information.
//!   TODO: Find out when this was last updated and potentially update these types automatically, as for other canisters.

use candid::{CandidType, Deserialize};
use serde::Serialize;


pub type AnchorNumber = u64;
#[derive(CandidType, Serialize, Deserialize)]
#[allow(missing_docs)] // Please see the original code upstream for details
pub struct InternetIdentityInit {
    pub assigned_user_number_range: Option<(AnchorNumber, AnchorNumber)>,
    pub archive_config: Option<ArchiveConfig>,
    pub canister_creation_cycles_cost: Option<u64>,
    pub register_rate_limit: Option<RateLimitConfig>,
    pub max_num_latest_delegation_origins: Option<u64>,
    pub migrate_storage_to_memory_manager: Option<bool>,
}
#[derive(CandidType, Serialize, Deserialize)]
pub struct RateLimitConfig {
    /// Time it takes for a rate limiting token to be replenished.
    pub time_per_token_ns: u64,
    /// How many tokens are at most generated (to accommodate peaks).
    pub max_tokens: u64,
}
/// Configuration parameters of the archive to be used on the next deployment.
#[derive(CandidType, Serialize, Deserialize)]
pub struct ArchiveConfig {
    /// Wasm module hash that is allowed to be deployed to the archive canister.
    pub module_hash: [u8; 32],
    /// Buffered archive entries limit. If reached, II will stop accepting new anchor operations
    /// until the buffered operations are acknowledged by the archive.
    pub entries_buffer_limit: u64,
    /// Polling interval at which the archive should fetch buffered archive entries from II (in nanoseconds).
    pub polling_interval_ns: u64,
    /// Max number of archive entries to be fetched in a single call.
    pub entries_fetch_limit: u16,
    /// How the entries get transferred to the archive.
    /// This is opt, so that the configuration parameter can be removed after switching from push to pull.
    /// Defaults to Push (legacy mode).
    pub archive_integration: Option<ArchiveIntegration>,
}

#[derive(CandidType, Serialize, Deserialize)]
pub enum ArchiveIntegration {
    #[serde(rename = "push")]
    Push,
    #[serde(rename = "pull")]
    Pull,
}