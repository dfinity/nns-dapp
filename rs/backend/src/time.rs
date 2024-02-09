use dfn_core::api::ic0;

#[must_use]
pub fn time_millis() -> u64 {
    time() / 1_000_000
}

#[must_use]
pub fn time() -> u64 {
    unsafe { ic0::time() }
}
