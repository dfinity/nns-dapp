//! The canister time, with a fixed value in unit tests.

/// Gets the current time, in nanoseconds since the epoch (1970-01-01).
#[cfg(not(test))]
#[must_use]
pub fn time() -> u64 {
    ic_cdk::api::time()
}

/// Gets a fixed time. Unit tests run outside a canister, where `ic_cdk::api::time` panics.
#[cfg(test)]
#[must_use]
pub fn time() -> u64 {
    1_724_314_428_000_000_000
}
