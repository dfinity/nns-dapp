//! Test doubles for the system API that the caller checks use.
//!
//! The system API traps outside a canister, so a test provides the caller and
//! the controllers itself.
#![allow(clippy::panic)]

use candid::Principal;
use std::cell::RefCell;

thread_local! {
    /// The principal that the test presents as the caller.
    static CALLER: RefCell<Principal> = RefCell::new(Principal::anonymous());
    /// The principals that the test presents as the controllers of the canister.
    static CONTROLLERS: RefCell<Vec<Principal>> = RefCell::new(Vec::new());
}

/// Sets the caller and the controllers for the current test.
pub fn set_caller_and_controllers(caller: Principal, controllers: &[Principal]) {
    CALLER.with(|value| *value.borrow_mut() = caller);
    CONTROLLERS.with(|value| *value.borrow_mut() = controllers.to_vec());
}

/// Returns `true` if the caller of the current test is one of its controllers.
pub(super) fn caller_is_controller() -> bool {
    CALLER.with(|caller| CONTROLLERS.with(|controllers| controllers.borrow().contains(&caller.borrow())))
}

/// Stops the current test call with an error message.
///
/// A test has no trap, so the message arrives as a panic.
pub(super) fn deny(message: &str) -> ! {
    panic!("{message}")
}
