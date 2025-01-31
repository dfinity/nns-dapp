//! State from/to a stable memory partition in the `SchemaLabel::AccountsInStableMemory` format.
use crate::state::{with_partitions, Partitions, StableState, State};
use dfn_core::api::trap_with;
use ic_cdk::println;

impl State {
    /// Save heap to raw or virtual memory.
    pub fn save_heap_to_managed_memory(&self) {
        println!("START state::save_heap: ()");
        let bytes = self.encode();
        with_partitions(|p| p.write_bytes_to_managed_memory(&bytes));
    }
    /// Create the state from stable memory in the `SchemaLabel::Map` format.
    #[must_use]
    pub fn recover_heap_from_managed_memory() -> Self {
        let bytes = with_partitions(Partitions::read_bytes_from_managed_memory);
        State::decode(bytes).unwrap_or_else(|e| {
            trap_with(&format!("Decoding stable memory failed. Error: {e:?}"));
        })
    }
}
