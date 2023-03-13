use crate::STATE;
use candid::CandidType;
use dfn_core::api::ic0;
use serde::Deserialize;

#[derive(CandidType, Deserialize, Clone)]
pub struct PerformanceCounter {
    timestamp_ns_since_epoch: u64,
    name: String,
    instruction_count: u64,
}
impl PerformanceCounter {
    pub fn new(name: &str) -> Self {
        let name = name.to_string();
        let timestamp_ns_since_epoch = crate::time::time();
        let instruction_count = crate::perf::raw_instruction_count();
        PerformanceCounter {
            timestamp_ns_since_epoch,
            name,
            instruction_count,
        }
    }
}

/// Gets the instruction count.
///
/// See: https://internetcomputer.org/docs/current/references/ic-interface-spec#system-api-performance-counter
fn raw_instruction_count() -> u64 {
    // Note: The spec says that this is an i64 but the type is actually a u64.
    unsafe { ic0::performance_count(0) }
}

/// Gets the value of the instruction count and saves it with the given label.
pub fn record_instruction_count(name: &str) {
    save_instruction_count(PerformanceCounter::new(name));
}

/// Saves an instruction count; useful if the instruction count was captured independently.
pub fn save_instruction_count(count: PerformanceCounter) {
    STATE.with(|s| s.accounts_store.borrow_mut().save_instruction_count(count))
}
