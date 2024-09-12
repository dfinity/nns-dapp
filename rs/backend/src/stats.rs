use crate::metrics_encoder::MetricsEncoder;
use crate::perf::PerformanceCount;
use crate::state::State;
use crate::STATE;
use candid::CandidType;
use serde::Deserialize;
#[cfg(test)]
mod tests;
#[cfg(target_arch = "wasm32")]
use core::arch::wasm32::memory_size as wasm_memory_size;
#[cfg(target_arch = "wasm32")]
use ic_cdk::api::stable::stable_size;
#[cfg(target_arch = "wasm32")]
use ic_cdk::api::stable::WASM_PAGE_SIZE_IN_BYTES;
const GIBIBYTE: u64 = 1 << 30;

/// Returns basic stats for frequent monitoring.
pub fn get_stats(state: &State) -> Stats {
    let mut ans = Stats::default();
    // Collect values from various subcomponents
    state.accounts_store.borrow().get_stats(&mut ans);
    state.performance.borrow().get_stats(&mut ans);
    ans.stable_memory_size_bytes = Some(stable_memory_size_bytes());
    ans.wasm_memory_size_bytes = Some(wasm_memory_size_bytes());
    // Return all the values
    ans
}

#[derive(CandidType, Deserialize, Default, Debug, Eq, PartialEq)]
pub struct Stats {
    pub accounts_count: u64,
    pub sub_accounts_count: u64,
    pub hardware_wallet_accounts_count: u64,
    pub block_height_synced_up_to: Option<u64>,
    pub seconds_since_last_ledger_sync: u64,
    pub neurons_created_count: u64,
    pub neurons_topped_up_count: u64,
    pub transactions_to_process_queue_length: u32,
    pub performance_counts: Vec<PerformanceCount>,
    // TODO: After a transition period, these two can be required rather than being optional.
    //       The transition period can be considered over when most deployments, including
    //       production, CI and snsdemo populate these fields.
    pub stable_memory_size_bytes: Option<u64>,
    pub wasm_memory_size_bytes: Option<u64>,
    pub migration_countdown: Option<u32>, // When non-zero, a migration is in progress.
    pub exceptional_transactions_count: Option<u32>,
    // TODO[NNS1-2913]: Delete this once the stable memory migration is complete.  This is used purely to get
    // an idea of how long, in wall clock time, migration is likely to take.
    pub periodic_tasks_count: Option<u32>,
    /// Whether account stats were recomputed on upgrade.
    pub accounts_db_stats_recomputed_on_upgrade: Option<bool>,
}

/// Encodes the metrics into the format scraped by the monitoring system.
///
/// TODO: Use the new `ic_metrics_encoder` crate instead.  See: <https://docs.rs/ic-metrics-encoder/1.1.1/ic_metrics_encoder/struct.MetricsEncoder.html>
#[allow(clippy::cast_precision_loss)] // We are converting u64 to f64
pub fn encode_metrics(w: &mut MetricsEncoder<Vec<u8>>) -> std::io::Result<()> {
    let stats = STATE.with(get_stats);
    w.encode_gauge(
        "neurons_created_count",
        stats.neurons_created_count as f64,
        "Number of neurons created.",
    )?;
    w.encode_gauge(
        "neurons_topped_up_count",
        stats.neurons_topped_up_count as f64,
        "Number of neurons topped up by the canister.",
    )?;
    w.encode_gauge(
        "accounts_count",
        stats.accounts_count as f64,
        "Number of accounts created.",
    )?;
    w.encode_gauge(
        "sub_accounts_count",
        stats.sub_accounts_count as f64,
        "Number of sub accounts created.",
    )?;
    w.encode_gauge(
        "hardware_wallet_accounts_count",
        stats.hardware_wallet_accounts_count as f64,
        "Number of hardware wallet accounts created.",
    )?;
    w.encode_gauge(
        "seconds_since_last_ledger_sync",
        stats.seconds_since_last_ledger_sync as f64,
        "Number of seconds since last ledger sync.",
    )?;
    w.encode_gauge(
        "nns_dapp_stable_memory_size_gib",
        gibibytes(stable_memory_size_bytes()),
        "Amount of stable memory used by this canister, in binary gigabytes",
    )?;
    w.encode_gauge(
        "nns_dapp_wasm_memory_size_gib",
        gibibytes(wasm_memory_size_bytes()),
        "Amount of wasm memory used by this canister, in binary gigabytes",
    )?;
    w.encode_gauge(
        "nns_dapp_migration_countdown",
        f64::from(stats.migration_countdown.unwrap_or(0)),
        "When non-zero, a migration is in progress.",
    )?;
    w.encode_gauge(
        "exceptional_transactions_count",
        f64::from(stats.exceptional_transactions_count.unwrap_or(0)),
        "The number of exceptional transactions in the canister log.",
    )?;
    w.encode_gauge(
        "periodic_tasks_count",
        f64::from(stats.periodic_tasks_count.unwrap_or(0)),
        "The number of times the periodic tasks runner has run successfully (ignoring async tasks).",
        // Note: The counter is always incremented, however on Wasm trap (e.g. `ic_cdk::trap` or Rust `panic!`) the increment is lost.
    )?;
    Ok(())
}

/// The stable memory size in bytes
#[must_use]
pub fn stable_memory_size_bytes() -> u64 {
    #[cfg(target_arch = "wasm32")]
    {
        stable_size() * (WASM_PAGE_SIZE_IN_BYTES)
    }
    #[cfg(not(target_arch = "wasm32"))]
    {
        0
    }
}

/// The WASM memory size in bytes
#[must_use]
pub fn wasm_memory_size_bytes() -> u64 {
    #[cfg(target_arch = "wasm32")]
    {
        (wasm_memory_size(0) as u64) * (WASM_PAGE_SIZE_IN_BYTES)
    }
    // This can happen only for test builds.  When compiled for a canister, the target is
    // always wasm32.
    #[cfg(not(target_arch = "wasm32"))]
    {
        0
    }
}

/// Convert bytes to binary gigabytes
#[must_use]
#[allow(clippy::cast_precision_loss)]
pub fn gibibytes(bytes: u64) -> f64 {
    (bytes as f64) / (GIBIBYTE as f64)
}
