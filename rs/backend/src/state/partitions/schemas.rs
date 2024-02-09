//! Sets up memory for a given schema.
#[cfg(test)]
use super::DefaultMemoryImpl;
use super::{PartitionType, Partitions};
#[cfg(test)]
use crate::accounts_store::schema::SchemaLabelBytes;
use crate::state::SchemaLabel;
use ic_cdk::println;
#[cfg(test)]
mod tests;

impl Partitions {
    /// Writes the schema label to the metadata partition.
    ///
    /// Note: This MUST be called by every constructor.
    #[cfg(test)]
    fn set_schema_label(&self, schema: SchemaLabel) {
        let schema_label_bytes = SchemaLabelBytes::from(schema);
        println!("Set schema label bytes to: {:?}", schema_label_bytes);
        self.growing_write(PartitionType::Metadata.memory_id(), 0, &schema_label_bytes[..]);
    }
    /// Gets the schema label from the metadata partition.
    #[must_use]
    pub fn schema_label(&self) -> SchemaLabel {
        let mut schema_label_bytes = [0u8; SchemaLabel::MAX_BYTES];
        self.read_exact(PartitionType::Metadata.memory_id(), 0, &mut schema_label_bytes)
            .expect("Metadata memory is not populated");
        println!("Read schema label bytes as: {:?}", schema_label_bytes);
        let schema_label = SchemaLabel::try_from(&schema_label_bytes[..]).unwrap_or_else(|err| {
            dfn_core::api::trap_with(&format!("Unknown schema: {err:?}"));
            unreachable!()
        });
        println!("Partitions schema label: {schema_label:?}");
        schema_label
    }
    /// Gets the memory partitioned appropriately for the given schema.
    ///
    /// If a schema uses raw memory, the memory is returned.
    #[cfg(test)]
    pub fn new_with_schema(memory: DefaultMemoryImpl, schema: SchemaLabel) -> Partitions {
        match schema {
            SchemaLabel::Map => panic!("Map schema does not use partitions"),
            SchemaLabel::AccountsInStableMemory => {
                let partitions = Partitions::from(memory);
                partitions.set_schema_label(schema);
                partitions
            }
        }
    }
}
