//! Tests for the aggregator state

use std::cell::RefCell;

use crate::{types::upstream::SnsCache, assets::Assets};

use super::{Config, StableState}; // Is this the EU?

struct StateSerdeTestVector {
    name: &'static str,
    state: StableState,
}

#[test]
fn serializing_and_deserializing_returns_original() {
    let test_vectors = vec![
        StateSerdeTestVector {
            name: "default",
            state: StableState::default(),
        },
        StateSerdeTestVector {
            name: "explicit_default",
            state: StableState {
                config: RefCell::new(Config::default()),
                sns_cache: RefCell::new(SnsCache::default()),
                assets: RefCell::new(Assets::default()),
            },
        },
        StateSerdeTestVector {
            name: "explicit_default",
            state: StableState {
                config: RefCell::new(Config::default()),
                sns_cache: RefCell::new(SnsCache::default()),
                assets: RefCell::new(Assets::default()),
            },
        },
    ];
    for StateSerdeTestVector { name, state } in test_vectors.iter() {
        let serialized = state
            .to_bytes()
            .map_err(|err| format!("Failed to serialize {name}: {err:?}"))
            .unwrap();
        let deserialized = StableState::from_bytes(&serialized)
            .map_err(|err| format!("Failed to deserialize {name}: {err:?}"))
            .unwrap();
        for fun in [|state: &StableState| state.sns_cache.borrow().all_sns.len()] {
            assert_eq!(fun(state), fun(&deserialized));
        }
    }
}
