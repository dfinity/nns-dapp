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
        pub static FUTURES: RefCell<VecDeque<Pin<Box<dyn Future<Output = ()> + 'static>>>> = RefCell::default();
    }

    pub fn spawn(future: impl Future<Output = ()> + 'static) {
        FUTURES.with(|futures| {
            futures.borrow_mut().push_back(Box::pin(future));
        });
    }

    pub fn block_on_all() {
        FUTURES.with(|futures| {
            for mut future in futures.borrow_mut().drain(..) {
                futures::executor::block_on(Pin::as_mut(&mut future));
            }
        });
    }
}
