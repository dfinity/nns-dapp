//! Tests for schema label serilaization.

use super::*;
use crate::accounts_store::schema::SchemaLabel;
use pretty_assertions::assert_eq;

#[test]
fn valid_label_with_invalid_checksum_should_fail() {
    let label_bytes = SchemaLabelBytes::from(SchemaLabel::Map);
    let mut label_bytes_with_invalid_checksum = label_bytes;
    label_bytes_with_invalid_checksum[SchemaLabel::CHECKSUM_OFFSET] ^= 1;
    assert_eq!(
        Err(SchemaLabelError::InvalidChecksum),
        SchemaLabel::try_from(&label_bytes_with_invalid_checksum)
    );
}

#[test]
fn empty_slice_should_fail_with_length_error() {
    let empty_slice: &[u8] = &[];
    assert_eq!(
        Err(SchemaLabelError::InsufficientBytes),
        SchemaLabel::try_from(empty_slice)
    );
}

#[test]
fn short_slice_should_fail_with_length_error() {
    let short_slice: &[u8] = &[8u8; SchemaLabel::MAX_BYTES - 1];
    assert_eq!(
        Err(SchemaLabelError::InsufficientBytes),
        SchemaLabel::try_from(short_slice)
    );
}

#[test]
fn adequate_slice_should_succeed() {
    let valid_label_bytes = SchemaLabelBytes::from(SchemaLabel::Map);
    for surplus in [0, 100] {
        let mut valid_label_bytes_with_surplus = vec![9; SchemaLabel::MAX_BYTES + surplus];
        valid_label_bytes_with_surplus[..SchemaLabel::MAX_BYTES].copy_from_slice(&valid_label_bytes);
        assert_eq!(
            Ok(SchemaLabel::Map),
            SchemaLabel::try_from(&valid_label_bytes_with_surplus[..]),
            "Failed to parse with a surplus of {} bytes",
            surplus
        );
    }
}
