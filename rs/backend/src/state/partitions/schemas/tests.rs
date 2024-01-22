//! Tesst for setting and getting the partition schema.
use super::*;
use strum::IntoEnumIterator;

#[test]
fn schema_label_should_be_persisted() {
    for schema in SchemaLabel::iter().filter(|schema| *schema != SchemaLabel::Map) {
        unimplemented!()
    }
}
