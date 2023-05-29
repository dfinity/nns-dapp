use crate::proposals::tests::payloads::get_payloads;
use crate::proposals::transform_payload_to_json;

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
