//! State from/to a stable memory partition in the `SchemaLabel::AccountsInStableMemory` format.
use super::State;
use crate::state::partitions::PartitionType;
use crate::state::StableState;
use dfn_core::api::trap_with;
use ic_cdk::println;
use ic_stable_structures::memory_manager::VirtualMemory;
use ic_stable_structures::{DefaultMemoryImpl, Memory};

impl State {
    /// Save heap to raw or virtual memory.
    pub fn save_heap_to_managed_memory(&self) {
        println!("START state::save_heap: ()");
        let bytes = self.encode();
        if let Ok(partitions) = self.partitions_maybe.borrow().as_ref() {
            let len = bytes.len();
            let length_field = u64::try_from(len)
                .unwrap_or_else(|e| {
                    trap_with(&format!(
                        "The serialized memory takes more than 2**64 bytes.  Amazing: {e:?}"
                    ));
                    unreachable!();
                })
                .to_be_bytes();
            partitions.growing_write(PartitionType::Heap.memory_id(), 0, &length_field);
            partitions.growing_write(PartitionType::Heap.memory_id(), 8, &bytes);
        } else {
            println!("END state::save_heap: ()");
            trap_with("No memory manager found.  Cannot save heap.");
            unreachable!();
        }
    }
    /// Create the state from stable memory in the `SchemaLabel::Map` format.
    pub fn recover_heap_from_managed_memory(memory: VirtualMemory<DefaultMemoryImpl>) -> Self {
        let candid_len = {
            let mut length_field = [0u8; 8];
            memory.read(0, &mut length_field);
            u64::from_be_bytes(length_field) as usize
        };
        let candid_bytes = {
            let mut candid_bytes = vec![0u8; candid_len];
            memory.read(8, &mut candid_bytes);
            candid_bytes
        };
        State::decode(candid_bytes).unwrap_or_else(|e| {
            trap_with(&format!("Decoding stable memory failed. Error: {e:?}"));
            unreachable!();
        })
    }
}
