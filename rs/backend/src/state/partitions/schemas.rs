//! Sets up memory for a given schema.
use super::DefaultMemoryImpl;
use super::Partitions;
use ic_stable_structures::memory_manager::MemoryManager;

impl Partitions {
    /// Gets the memory partitioned appropriately for the given schema.
    ///
    /// # Panics
    /// - If the schema label is not supported:
    ///   - The `Map` schema does not use partitions, so may not be used with this method.
    #[must_use]
    pub fn new(memory: DefaultMemoryImpl) -> Partitions {
        Partitions {
            memory_manager: MemoryManager::init(memory),
        }
    }
}
