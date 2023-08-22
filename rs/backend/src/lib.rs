//! Library for <https://nns.ic0.app>
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
