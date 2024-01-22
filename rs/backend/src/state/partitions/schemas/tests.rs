//! Tesst for setting and getting the partition schema.
use super::*;
use strum::IntoEnumIterator;

#[test]
fn schema_label_should_be_persisted() {
    for schema in SchemaLabel::iter().filter(|schema| *schema != SchemaLabel::Map) {
        // Prepare partitions with empty memory.
        let toy_memory = DefaultMemoryImpl::default();
        let memory_manager = MemoryManager::init(Rc::clone(&toy_memory));
        let partitions = Partitions::try_from_memory(Rc::clone(&toy_memory)).expect("Failed to get empty partitions");
        partitions.set_schema_label(schema);
        let read_schema = partitions.schema_label();
        assert_eq!(
            schema, read_schema,
            "Read schema does not match schema that was just set"
        );
        // Make sure that the label is persisted in stable memory, not just in RAM:
        let partitions = Partitions::try_from_memory(Rc::clone(&toy_memory)).expect("Failed to get empty partitions");
        let read_schema = partitions.schema_label();
        assert_eq!(schema, read_schema, "Schema label was not persisted to stable memory.");
    }
}
