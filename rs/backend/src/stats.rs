use crate::metrics_encoder::MetricsEncoder;
use crate::perf::PerformanceCount;
use crate::state::State;
use crate::STATE;
use candid::CandidType;
use icp_ledger::BlockIndex;
use serde::Deserialize;
#[cfg(test)]
mod tests;

pub fn get_stats(state: &State) -> Stats {
    let mut ans = Stats::default();
    // Collect values from various subcomponents
    state.accounts_store.borrow().get_stats(&mut ans);
    state.performance.borrow().get_stats(&mut ans);
    // Return all the values
    ans
}

#[derive(CandidType, Deserialize, Default, Debug, Eq, PartialEq)]
pub struct Stats {
    pub accounts_count: u64,
    pub sub_accounts_count: u64,
    pub hardware_wallet_accounts_count: u64,
    pub transactions_count: u64,
    pub block_height_synced_up_to: Option<u64>,
    pub earliest_transaction_timestamp_nanos: u64,
    pub earliest_transaction_block_height: BlockIndex,
    pub latest_transaction_timestamp_nanos: u64,
    pub latest_transaction_block_height: BlockIndex,
    pub seconds_since_last_ledger_sync: u64,
    pub neurons_created_count: u64,
    pub neurons_topped_up_count: u64,
    pub transactions_to_process_queue_length: u32,
    pub performance_counts: Vec<PerformanceCount>,
}

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
        "transactions_count",
        stats.transactions_count as f64,
        "Number of transactions processed by the canister.",
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
    Ok(())
}
