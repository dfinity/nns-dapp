use dfn_core::api::ic0;

/// Gets time.
///
/// TODO: Replace with: `ic_cdk::api::time`
#[must_use]
pub fn time() -> u64 {
    unsafe { ic0::time() }
}
