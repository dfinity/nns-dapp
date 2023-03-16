use crate::stats::Stats;
use crate::{StableState, STATE};
use candid::CandidType;
use dfn_candid::Candid;
use dfn_core::api::ic0;
use on_wire::{FromWire, IntoWire};
use serde::Deserialize;
use std::collections::VecDeque;
#[cfg(test)]
mod tests;

#[derive(CandidType, Deserialize, Debug, Default, Clone, Eq, PartialEq)]
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

#[derive(CandidType, Deserialize, Clone, Debug, Default, Eq, PartialEq)]
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

    pub fn get_stats(&self, stats: &mut Stats) {
        stats.instruction_counts = self.instruction_counts.iter().cloned().collect();
    }

    #[cfg(test)]
    pub fn test_data() -> Self {
        let mut ans = PerformanceCounts::default();
        ans.save_instruction_count(PerformanceCount::default());
        ans.save_instruction_count(PerformanceCount {
            timestamp_ns_since_epoch: 999,
            name: "Nein".to_string(),
            instruction_count: 1,
        });
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
