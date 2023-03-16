use super::PerformanceCounts;
use crate::state::StableState;

/// Given valid performance data, it should serialize and be parsed back to the original.
#[test]
fn perf_stable_memory_serde_works() {
    let test_vectors = vec![PerformanceCounts::test_data()];
    for data in test_vectors {
        let serialized: Vec<u8> = data.encode();
        let parsed = PerformanceCounts::decode(serialized).expect("Failed to parse serialized perf counts");
        assert_eq!(data, parsed);
    }
}

/// Decoding performance counters should never fail, even if the data is empty or junk.
/// The performance counters are not critical to the operation of the canister and failing
/// to parse them should never ever cause a canister upgrade to fail.
#[test]
fn perf_stable_memory_never_fails() {
    let junk_vectors: Vec<Vec<u8>> = vec!["", "finestkeyboardrandom"]
        .iter()
        .map(|x| x.as_bytes().to_vec())
        .collect();
    for data in junk_vectors {
        PerformanceCounts::decode(data).expect("Failed to decode perf counters");
    }
}
