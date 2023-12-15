//! Tests for schema label serilaization.

use super::*;
use crate::accounts_store::schema::SchemaLabel;
use strum::IntoEnumIterator;

#[test]
fn every_schema_label_should_serialize_and_deserialize() {
    for label in SchemaLabel::iter() {
        let label_bytes = SchemaLabelBytes::from(label);
        let label_deserialized = SchemaLabel::try_from(&label_bytes).unwrap();
        assert_eq!(label, label_deserialized);
    }
}

#[test]
fn unknown_schema_label_should_fail() {
    let invalid_label_bytes_without_checksum = [0x69; 4];
    assert!(
        SchemaLabel::try_from(&invalid_label_bytes_without_checksum).is_err(),
        "Test error: The bytes actually correspond to a legitimate schema label."
    );
    let label_bytes = SchemaLabel::with_checksum(invalid_label_bytes_without_checksum);
    assert_eq!(
        Err(SchemaLabelError::InvalidLabel(1768515945)),
        SchemaLabel::try_from(&label_bytes)
    );
}

#[test]
fn unknown_schema_label_with_invalid_checksum_should_report_invalid_checksum() {
    let label_bytes = [0x69; SchemaLabel::MAX_BYTES];
    let just_the_label: &SchemaBytesWithoutChecksum = &label_bytes
        [SchemaLabel::LABEL_OFFSET..SchemaLabel::LABEL_OFFSET + SchemaLabel::LABEL_BYTES]
        .try_into()
        .unwrap();
    assert!(
        SchemaLabel::try_from(just_the_label).is_err(),
        "Test error: The bytes actually correspond to a legitimate schema label."
    );
    // Note: If that is a valid checksum I must have won the lottery a zillion times over.
    assert_eq!(
        Err(SchemaLabelError::InvalidChecksum),
        SchemaLabel::try_from(&label_bytes)
    );
}

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
