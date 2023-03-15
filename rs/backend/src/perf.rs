use crate::{STATE, StableState};
use candid::CandidType;
use dfn_candid::Candid;
use on_wire::{FromWire, IntoWire};
use std::collections::VecDeque;
use dfn_core::api::ic0;
use serde::Deserialize;
#[cfg(test)]
mod tests;

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

    #[cfg(test)]
    pub fn test_data() -> Self {
        let mut ans = PerformanceCounts::default();
        ans.save_instruction_count(PerformanceCount::default());
        ans.save_instruction_count(PerformanceCount{ timestamp_ns_since_epoch: 999, name: "Nein".to_string(), instruction_count: 1 });
        ans.save_instruction_count(PerformanceCount::default());
        ans
    }
}

impl StableState for PerformanceCounts {
    /// Try to serialize state. On error, return an empty vector.
    fn encode(&self) -> Vec<u8> {
        Candid((self,)).into_bytes().unwrap_or_default()
    }

    /// Parse performance counts.  On error, return a blank new structure.
    fn decode(bytes: Vec<u8>) -> Result<Self, String> {
      let (ans,) = Candid::from_bytes(bytes).map(|c| c.0).unwrap_or_default();
      Ok(ans)
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
