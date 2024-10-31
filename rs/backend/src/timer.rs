#[cfg(not(test))]
pub use ic_cdk_timers::{set_timer, set_timer_interval};

#[cfg(test)]
pub use testing::{set_timer, set_timer_interval};

#[cfg(test)]
pub mod testing {
    use ic_cdk_timers::TimerId;
    use slotmap::SlotMap;
    use std::cell::RefCell;
    use std::time::Duration;

    pub struct Timer {
        pub delay: Duration,
        pub func: Box<dyn FnOnce()>,
    }

    pub struct TimerInterval {
        pub interval: Duration,
        pub func: Box<dyn FnMut()>,
    }

    thread_local! {
        pub static TIMERS: RefCell<SlotMap<TimerId, Timer>> = RefCell::default();
        pub static TIMER_INTERVALS: RefCell<SlotMap<TimerId, TimerInterval>> = RefCell::default();
    }

    pub fn set_timer(delay: Duration, func: impl FnOnce() + 'static) -> TimerId {
        TIMERS.with(|timers| {
            timers.borrow_mut().insert(Timer {
                delay,
                func: Box::new(func),
            })
        })
    }

    pub fn set_timer_interval(interval: Duration, func: impl FnMut() + 'static) -> TimerId {
        TIMER_INTERVALS.with(|timer_intervals| {
            timer_intervals.borrow_mut().insert(TimerInterval {
                interval,
                func: Box::new(func),
            })
        })
    }

    pub fn drain_timers() -> Vec<Timer> {
        TIMERS.with(|timers| timers.borrow_mut().drain().map(|(_, timer)| timer).collect())
    }

    pub fn drain_timer_intervals() -> Vec<TimerInterval> {
        TIMER_INTERVALS.with(|timers| timers.borrow_mut().drain().map(|(_, timer)| timer).collect())
    }
}
