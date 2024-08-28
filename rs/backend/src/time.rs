/// Gets current timestamp, in nanoseconds since the epoch (1970-01-01)
#[must_use]
pub fn time() -> u64 {
    ic_cdk::api::time()
}
