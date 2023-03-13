// Tests should be able to fail:
#![allow(clippy::panic)]
#![allow(clippy::expect_used)]
#![allow(clippy::unwrap_used)]

use crate::state::StableState;

#[test]
#[ignore] // Thi stest fails due to an issue serializing & parsing icrc1 metadata.  To be fixed.
fn can_serde() {
    let sample_json = include_str!("stable_data.json");
    let sample: StableState = serde_json::from_str(sample_json).expect("Failed to parse stable state as JSON");
    let bytes = sample.to_bytes().expect("Failed to serialize stable state");
    let _restored = StableState::from_bytes(&bytes).expect("Failed to parse stable state");
    //assert_eq!(sample, restored); // TODO: Implement Eq, PartialEq on the relevant types.
}
