use crate::STATE;
use candid::CandidType;
use dfn_core::api::ic0;
use serde::Deserialize;

#[derive(CandidType, Deserialize, Clone)]
pub struct PerformanceCounter {
    timestamp_ns_since_epoch: u64,
    name: String,
    instruction_counter: u64,
}
impl PerformanceCounter {
    pub fn new(name: &str) -> Self {
        let name = name.to_string();
        let timestamp_ns_since_epoch = crate::time::time();
        let instruction_counter = crate::perf::raw_instruction_counter();
        PerformanceCounter {
            timestamp_ns_since_epoch,
            name,
            instruction_counter,
        }
    }
}

/// Gets the instruction counter.
///
/// See: https://internetcomputer.org/docs/current/references/ic-interface-spec#system-api-performance-counter
fn raw_instruction_counter() -> u64 {
    // Note: The spec says that this is an i64 but the type is actually a u64.
    unsafe { ic0::performance_counter(0) }
}

/// Gets the value of the instruction counter and saves it with the given label.
pub fn record_instruction_counter(name: &str) {
    STATE.with(|s| {
        s.accounts_store
            .borrow_mut()
            .save_instruction_counter(PerformanceCounter::new(name))
    })
}

/// Saves an instruction counter; useful if the instruction count was captured independently.
pub fn save_instruction_counter(counter: PerformanceCounter) {
    STATE.with(|s| s.accounts_store.borrow_mut().save_instruction_counter(counter))
}
