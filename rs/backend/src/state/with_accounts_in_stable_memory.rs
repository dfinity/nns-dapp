//! State from/to a stable memory partition in the `SchemaLabel::AccountsInStableMemory` format.
use crate::state::{partitions::PartitionsMaybe, Partitions, StableState, State};
use dfn_core::api::trap_with;
use ic_cdk::println;

impl State {
    /// Save heap to raw or virtual memory.
    pub fn save_heap_to_managed_memory(&self) {
        println!("START state::save_heap: ()");
        let candid_bytes = self.encode();
        match &self.partitions_maybe {
            PartitionsMaybe::Partitions(partitions) => {
                partitions.write_bytes_to_managed_memory(&candid_bytes);
            }
            PartitionsMaybe::None(_) => {
                println!("END state::save_heap: ()");
                trap_with("No memory manager found.  Cannot save heap.");
            }
        }
    }
    /// Create the state from stable memory in the `SchemaLabel::Map` format.
    #[must_use]
    pub fn recover_heap_from_managed_memory(partitions: &Partitions) -> Self {
        let candid_bytes = partitions.read_bytes_from_managed_memory();
        State::decode(candid_bytes).unwrap_or_else(|e| {
            trap_with(&format!("Decoding stable memory failed. Error: {e:?}"));
        })
    }
}
