/// Gets current timestamp, in nanoseconds since the epoch (1970-01-01)
#[cfg(not(test))]
#[must_use]
pub fn time() -> u64 {
    ic_cdk::api::time()
}

#[cfg(test)]
pub use testing::time;

#[cfg(test)]
pub mod testing {
    use std::cell::RefCell;

    thread_local! {
        static TIME: RefCell<u64> = RefCell::new(1_724_314_428_000_000_000);
    }

    pub fn time() -> u64 {
        TIME.with(|t| *t.borrow())
    }

    pub fn set_time(time: u64) {
        TIME.with(|t| *t.borrow_mut() = time);
    }
}
