//! State from/to stable memory in the classic "Candid in raw memory" format.
use super::{StableState, State};
use dfn_core::{api::trap_with, stable};

impl State {
    /// Save any unsaved state to stable memory in the `SchemaLabel::Map` format.
    pub fn save_to_raw_memory(&self) {
        let bytes = self.encode();
        stable::set(&bytes);
    }
    /// Create the state from stable memory in the `SchemaLabel::Map` format.
    pub fn recover_from_raw_memory() -> Self {
        dfn_core::api::print(format!("state::recover_from_raw_memory: ()"));
        let bytes = stable::get();
        State::decode(bytes).unwrap_or_else(|e| {
            trap_with(&format!("Decoding stable memory failed. Error: {e:?}"));
            unreachable!();
        })
    }
}
