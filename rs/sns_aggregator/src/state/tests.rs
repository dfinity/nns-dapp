//! Tests for the aggregator state
#![allow(clippy::panic)]
#![allow(clippy::expect_used)]
#![allow(clippy::unwrap_used)]

use std::{cell::RefCell, collections::BTreeMap};

use candid::{Nat, Principal};

use crate::{
    assets::Assets,
    types::upstream::{SnsCache, UpstreamData},
};

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
            name: "toy_with_upstream_data",
            state: StableState {
                config: RefCell::new(Config::default()),
                sns_cache: RefCell::new(SnsCache {
                    sns_to_get: Vec::new(),
                    all_sns: Vec::new(),
                    upstream_data: {
                        let mut map = BTreeMap::new();
                        map.insert(
                            Principal::from_text("qsgjb-riaaa-aaaaa-aaaga-cai").unwrap(),
                            UpstreamData::default(),
                        );
                        map
                    },
                    last_partial_update: 1243,
                    last_update: 123,
                    max_index: 999,
                }),
                assets: RefCell::new(Assets::default()),
            },
        },
        /* Disabled because serde is broken for Nat in Candid 0.8.4.  Should be fixed in 0.9.0 when that is released.
           Tests for the Nat serialization issue are included in this file but marked "ignore".  See "nat_serde_XXX_works".
           To test a new Canid library, bump the version and run the Nat tests.  If those pass, re-enable this test.
        StateSerdeTestVector {
            name: "Sample stable data",
            state: serde_json::from_str(include_str!("stable_data.json")).expect("Failed to parse stable state as JSON"),
        },
        */
    ];
    for StateSerdeTestVector { name, state } in test_vectors.iter() {
        let serialized = state
            .to_bytes()
            .map_err(|err| format!("Failed to serialize {name}: {err:?}"))
            .unwrap();
        let deserialized = StableState::from_bytes(&serialized)
            .map_err(|err| format!("Failed to deserialize {name}: {err:?}"))
            .unwrap();
        for fun in [
            |state: &StableState| state.sns_cache.borrow().all_sns.len(),
            |state: &StableState| state.assets.borrow().len(),
        ] {
            assert_eq!(fun(state), fun(&deserialized));
        }
    }
}

#[test]
#[ignore] // Should be fixed in candid 0.9.x (current 0.8.4; version 0.9.0 is in beta; other dependencies will have to be bumped to match.)
fn nat_serde_json_works() {
    let test_vectors = [Nat::from(0)];
    for number in test_vectors {
        let serialized = serde_json::to_string(&number).expect("Failed to serialize Nat");
        let parsed: Nat = serde_json::from_str(&serialized).expect("Failed to parse Nat");
        assert_eq!(number, parsed);
    }
}

#[test]
#[ignore] // Should be fixed in candid 0.9.x (current 0.8.4; version 0.9.0 is in beta; other dependencies will have to be bumped to match.)
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
