//! Tests for the aggregator state

use std::cell::RefCell;

use candid::Nat;

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

#[test]
fn nat_serde_json_works() {
    let test_vectors = [Nat::from(0)];
    for number in test_vectors {
        let serialized = serde_json::to_string(&number).expect("Failed to serialize Nat");
        let parsed: Nat = serde_json::from_str(&serialized).expect("Failed to parse Nat");
        assert_eq!(number, parsed);
    }
}

#[test]
fn nat_serde_cbor_works() {
    let test_vectors = [Nat::from(0)];
    for number in test_vectors {
        let serialized = serde_cbor::to_vec(&number).expect("Failed to serialize Nat");
        let parsed: Nat = serde_json::from_slice(&serialized).expect("Failed to parse Nat");
        assert_eq!(number, parsed);
    }
}

#[test]
fn nat_candid_works() {
    let test_vectors = [Nat::from(0)];
    for number in test_vectors {
        let serialized = {
            let mut ser = candid::ser::IDLBuilder::new();
            ser.arg(&number).expect("Failed to serialize Nat");
ser.serialize_to_vec().expect("Failed to convert serializer to bytes")
        };
        let parsed: Nat = {
            let mut de = candid::de::IDLDeserialize::new(&serialized).expect("Failed to make serializer");
            de.get_value().expect("Failed to parse Nat")
        };
        assert_eq!(number, parsed);
    }
}