use crate::{STATE, StableState};
use candid::CandidType;
use dfn_candid::Candid;
use on_wire::{FromWire, IntoWire};
use std::collections::VecDeque;
use dfn_core::api::ic0;
use serde::Deserialize;

#[derive(CandidType, Deserialize, Default, Clone)]
pub struct PerformanceCount {
    timestamp_ns_since_epoch: u64,
    name: String,
    instruction_count: u64,
}
impl PerformanceCount {
    pub fn new(name: &str) -> Self {
        let name = name.to_string();
        let timestamp_ns_since_epoch = crate::time::time();
        let instruction_count = crate::perf::raw_instruction_count();
        PerformanceCount {
            timestamp_ns_since_epoch,
            name,
            instruction_count,
        }
    }
}

#[derive(CandidType, Deserialize, Clone, Default)]
pub struct PerformanceCounts {
    pub instruction_counts: VecDeque<PerformanceCount>,
}

impl PerformanceCounts {
    pub fn save_instruction_count(&mut self, count: PerformanceCount) {
        if self.instruction_counts.len() >= 100 {
            self.instruction_counts.pop_front();
        }
        self.instruction_counts.push_back(count);
    }
}

impl StableState for PerformanceCounts {
    fn encode(&self) -> Vec<u8> {
        Candid((self,)).into_bytes().unwrap()
    }

    fn decode(bytes: Vec<u8>) -> Result<Self, String> {
        todo!()
    }
}

/// Gets the instruction count.
///
/// See: https://internetcomputer.org/docs/current/references/ic-interface-spec#system-api-performance-counter
fn raw_instruction_count() -> u64 {
    // Note: The spec says that this is an i64 but the type is actually a u64.
    unsafe { ic0::performance_counter(0) }
}

/// Gets the value of the instruction count and saves it with the given label.
pub fn record_instruction_count(name: &str) {
    save_instruction_count(PerformanceCount::new(name));
}

/// Saves an instruction count; useful if the instruction count was captured independently.
pub fn save_instruction_count(count: PerformanceCount) {
    STATE.with(|s| s.performance.borrow_mut().save_instruction_count(count))
}
