use dfn_core::api::ic0;
use crate::STATE;

/// Gets the instruction counter.
/// 
/// See: https://internetcomputer.org/docs/current/references/ic-interface-spec#system-api-performance-counter
pub fn instruction_counter() -> u64 {
    // Note: The spec says that this is an i64 but the type is actually a u64.
    unsafe {ic0::performance_counter(0)}
}

/// Records an instruction counter.
pub fn record_instruction_counter(name: &str) {
    STATE.with(|s| s.accounts_store.borrow_mut().record_instruction_counter(name.to_string()))
}