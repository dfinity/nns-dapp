//! Sets up memory for a given schema.

use crate::accounts_store::schema::SchemaLabelBytes;

use super::*;
use crate::state::SchemaLabel;

impl Partitions {
    /// Writes the schema label to the metadata partition.
    fn set_schema_label(&self, schema: SchemaLabel) {
        let schema_label_bytes = SchemaLabelBytes::from(schema);
        self.growing_write(Self::METADATA_MEMORY_ID, 0, &schema_label_bytes[..]);
    }
    pub fn schema_label(&self) -> Option<SchemaLabel> { // TODO: Make this return a SchemaLabel instead of an Option<SchemaLabel>
        let mut schema_label_bytes = [0u8; SchemaLabel::MAX_BYTES];
        self.try_read(Self::METADATA_MEMORY_ID, 0, &mut schema_label_bytes)
            .ok()
            .and_then(|_| SchemaLabel::try_from(&schema_label_bytes[..]).ok())
    }
    /// Gets the memory partitioned appropriately for the given schema.
    ///
    /// If a schema uses raw memory, the memory is returned.
    pub fn new_for_schema(memory: DefaultMemoryImpl, schema: SchemaLabel) -> Result<Partitions, DefaultMemoryImpl> {
        match schema {
            SchemaLabel::Map => Err(memory),
            SchemaLabel::AccountsInStableMemory => {
                let partitions = Partitions::from(memory);
                partitions.set_schema_label(schema);
                Ok(partitions)
            }
        }
    }
}
