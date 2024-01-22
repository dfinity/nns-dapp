//! Tesst for setting and getting the partition schema.
use super::*;
use strum::IntoEnumIterator;

fn schemas_that_use_partitions() -> impl Iterator<Item = SchemaLabel> {
    // Note: The Map schema does not use partitions, so we exclude it.
    SchemaLabel::iter().filter(|schema| *schema != SchemaLabel::Map)
}

#[test]
fn schema_label_should_be_persisted() {
    for schema in schemas_that_use_partitions() {
        // Prepare partitions with empty memory.
        let toy_memory = DefaultMemoryImpl::default();
        let memory_manager = MemoryManager::init(Rc::clone(&toy_memory));
        let partitions = Partitions::try_from_memory(Rc::clone(&toy_memory)).expect("Failed to get empty partitions");
        // Set the schema label
        partitions.set_schema_label(schema);
        let read_schema = partitions.schema_label();
        assert_eq!(schema, read_schema, "Schema does not match schema that was just set");
        // Make sure that the label is persisted in stable memory, not just in RAM:
        let partitions = Partitions::try_from_memory(Rc::clone(&toy_memory)).expect("Failed to get empty partitions");
        let read_schema = partitions.schema_label();
        assert_eq!(schema, read_schema, "Schema label was not persisted to stable memory.");
    }
}

#[test]
fn should_be_able_to_create_partitions_with_any_schema() {
    for schema in schemas_that_use_partitions() {
        // Prepare partitions with empty memory.
        let toy_memory = DefaultMemoryImpl::default();
        let partitions = Partitions::new_with_schema(toy_memory, schema);
        let read_schema = partitions.schema_label();
        assert_eq!(
            schema, read_schema,
            "Partitions were not created with the expected schema."
        );
    }
}
