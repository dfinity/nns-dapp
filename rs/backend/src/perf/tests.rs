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
    let junk_vectors: Vec<Vec<u8>> = ["", "finestkeyboardrandom"]
        .iter()
        .map(|x| x.as_bytes().to_vec())
        .collect();
    for data in junk_vectors {
        PerformanceCounts::decode(data).expect("Failed to decode perf counters");
    }
}

/// When truncating the most recent exceptional transactions are kept
#[test]
fn most_recent_exceptional_transactions_are_retained() {
    let mut perf = PerformanceCounts::default();
    let num_inserted = PerformanceCounts::MAX_EXCEPTIONAL_TRANSACTIONS + 20;
    for i in 0..num_inserted {
        perf.record_exceptional_transaction_id(i as u64);
    }
    assert_eq!(
        perf.exceptional_transactions.as_ref().unwrap().len(),
        PerformanceCounts::MAX_EXCEPTIONAL_TRANSACTIONS
    );
    let first_id = perf
        .exceptional_transactions
        .as_ref()
        .unwrap()
        .iter()
        .next()
        .copied()
        .unwrap();
    assert_eq!(first_id, num_inserted as u64 - 1, "Expected to have the most recent ID");
}
