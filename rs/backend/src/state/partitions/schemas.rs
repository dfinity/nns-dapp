//! Sets up memory for a given schema.

use crate::accounts_store::schema::SchemaLabelBytes;

use super::*;
use crate::state::SchemaLabel;

impl Partitions {
    /// Writes the schema label to the metadata partition.
    ///
    /// Note: This MUST be called by every constructor.
    fn set_schema_label(&self, schema: SchemaLabel) {
        let schema_label_bytes = SchemaLabelBytes::from(schema);
        self.growing_write(Self::METADATA_MEMORY_ID, 0, &schema_label_bytes[..]);
    }
    pub fn schema_label(&self) -> SchemaLabel {
        // TODO: Make this return a SchemaLabel instead of an Option<SchemaLabel>
        let mut schema_label_bytes = [0u8; SchemaLabel::MAX_BYTES];
        self.try_read(Self::METADATA_MEMORY_ID, 0, &mut schema_label_bytes)
            .expect("Metadata memory is not populated");

        SchemaLabel::try_from(&schema_label_bytes[..]).expect("Unrecognized schema label.")
        // TODO: In the error, include the schema label bytes
    }
    /// Gets the memory partitioned appropriately for the given schema.
    ///
    /// If a schema uses raw memory, the memory is returned.
    pub fn new_for_schema(memory: DefaultMemoryImpl, schema: SchemaLabel) -> Partitions {
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
