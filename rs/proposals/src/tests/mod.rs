//! Tests that the proposals crate can indeed express proposals as JSON.
use super::*;

use crate::{
    canisters::nns_governance::api::{InstallCode, NeuronId, Proposal},
    tests::payloads::get_payloads,
};

use ic_principal::Principal;

mod args;
mod payloads;

#[test]
fn payload_deserialization() {
    for (nns_function_id, payload) in get_payloads() {
        let transformed = transform_payload_to_json(nns_function_id, &payload);
        assert!(transformed.is_ok());
        println!("{}", transformed.unwrap());
    }
}
