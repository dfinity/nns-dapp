//! Heap from/to a stable memory partition in the `SchemaLabel::Map` format.
use super::State;
use crate::state::StableState;
use dfn_core::api::trap_with;
use ic_stable_structures::memory_manager::VirtualMemory;
use ic_stable_structures::{DefaultMemoryImpl, Memory};

impl State {
    /// Save heap as Map in virtual memory.
    pub fn save_to_map(&self, memory: DefaultMemoryImpl) {
        let bytes = self.encode();
        let len = bytes.len();
        let length_field = u64::try_from(len)
            .unwrap_or_else(|e| {
                trap_with(&format!(
                    "The serialized memory takes more than 2**64 bytes.  Amazing: {e:?}"
                ));
                unreachable!();
            })
            .to_be_bytes();
        memory.write(0, &length_field);
        memory.write(8, &bytes);
    }
    /// Create the state from stable memory in the `SchemaLabel::Map` format.
    pub fn recover_from_map(memory: VirtualMemory<DefaultMemoryImpl>) -> Self {
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
