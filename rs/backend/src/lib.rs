//! Library for <https://nns.ic0.app>
//!
//! Note: The types are accessed by the nns-dapp directly from `main.rs`, not via this library.
//!
//! Note: This library is for utilities and tools that need access to the types.
pub mod accounts_store;
pub mod arguments;
pub mod assets;
pub mod constants;
pub mod metrics_encoder;
pub mod multi_part_transactions_processor;
pub mod perf;
pub mod state;
pub mod stats;
pub mod time;

use crate::state::{StableState, STATE};
