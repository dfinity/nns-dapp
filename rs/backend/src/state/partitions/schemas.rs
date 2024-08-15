//! Sets up memory for a given schema.
use super::DefaultMemoryImpl;
use super::{PartitionType, Partitions};
use crate::accounts_store::schema::SchemaLabelBytes;
use crate::state::SchemaLabel;
use ic_cdk::println;
use ic_stable_structures::memory_manager::MemoryManager;

impl Partitions {
    /// Writes the schema label to the metadata partition.
    ///
    /// Note: This MUST be called by every constructor.
    fn set_schema_label(&self, schema: SchemaLabel) {
        let schema_label_bytes = SchemaLabelBytes::from(schema);
        println!("Set schema label bytes to: {:?}", schema_label_bytes);
        self.growing_write(PartitionType::Metadata.memory_id(), 0, &schema_label_bytes[..]);
    }
    /// Gets the schema label from the metadata partition.
    ///
    /// # Panics
    /// - If the metadata partition has no schema label.
    /// - If the schema label is not supported.
    #[must_use]
    pub fn schema_label(&self) -> SchemaLabel {
        let mut schema_label_bytes = [0u8; SchemaLabel::MAX_BYTES];
        self.read_exact(PartitionType::Metadata.memory_id(), 0, &mut schema_label_bytes)
            .expect("Metadata memory is not populated");
        println!("Read schema label bytes as: {:?}", schema_label_bytes);
        let schema_label = SchemaLabel::try_from(&schema_label_bytes[..]).unwrap_or_else(|err| {
            dfn_core::api::trap_with(&format!("Unknown schema: {err:?}"));
        });
        println!("Partitions schema label: {schema_label:?}");
        schema_label
    }
    /// Gets the memory partitioned appropriately for the given schema.
    ///
    /// # Panics
    /// - If the schema label is not supported:
    ///   - The `Map` schema does not use partitions, so may not be used with this method.
    #[must_use]
    pub fn new(memory: DefaultMemoryImpl) -> Partitions {
        let memory_manager = MemoryManager::init(Self::copy_memory_reference(&memory));
        let partitions = Partitions {
            memory_manager,
            #[cfg(test)]
            memory,
        };
        partitions.set_schema_label(SchemaLabel::AccountsInStableMemory);
        partitions
    }
}
