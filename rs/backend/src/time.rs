use dfn_core::api::ic0;

pub fn time_millis() -> u64 {
    time() / 1_000_000
}

pub fn time() -> u64 {
    unsafe { ic0::time() }
}
