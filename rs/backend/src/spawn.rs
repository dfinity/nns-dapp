#[cfg(not(test))]
pub use ic_cdk::spawn;

#[cfg(test)]
pub use testing::spawn;

/// In unit tests we can't use `ic_cdk::spawn`. Instead, we add the future to a
/// queue without running it. If the test wants to run the futures, it can call
/// `testing::block_on_all`, or manually block on individual futures.
#[cfg(test)]
pub mod testing {
    use std::cell::RefCell;
    use std::collections::VecDeque;
    use std::future::Future;
    use std::pin::Pin;

    thread_local! {
        pub static SPAWNED_FUTURES: RefCell<VecDeque<Pin<Box<dyn Future<Output = ()> + 'static>>>> = RefCell::default();
    }

    pub fn spawn(future: impl Future<Output = ()> + 'static) {
        SPAWNED_FUTURES.with(|spawned_futures| {
            spawned_futures.borrow_mut().push_back(Box::pin(future));
        });
    }

    pub fn drain_spawned_futures() -> Vec<Pin<Box<dyn Future<Output = ()> + 'static>>> {
        SPAWNED_FUTURES.with(|spawned_futures| spawned_futures.borrow_mut().drain(..).collect())
    }
}
