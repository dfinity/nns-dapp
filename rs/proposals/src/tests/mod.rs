//! Tests that the proposals crate can indeed express proposals as JSON.
use super::*;

use crate::tests::payloads::get_payloads;

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
