//! Tests for the aggregator state

use super::StableState; // Is this the EU?

struct StateSerdeTestVector {
    name: &'static str,
    state: StableState,
}

#[test]
fn serializing_and_deserializing_returns_original() {
    let test_vectors = vec![StateSerdeTestVector{name: "default", state: StableState::default()}];
    for StateSerdeTestVector{name, state} in test_vectors.iter() {
        let serialized = state.to_bytes().expect("Failed to serialize");
        let deserialized = StableState::from_bytes(&serialized).expect("Failed to seserialize");
        for fun in [ |state: &StableState| state.sns_cache.borrow().all_sns.len() ] {
          assert_eq!(fun(state), fun(&deserialized));
        }
    }
}