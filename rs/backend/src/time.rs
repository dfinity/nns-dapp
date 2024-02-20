use dfn_core::api::ic0;

#[must_use]
pub fn time() -> u64 {
    unsafe { ic0::time() }
}
