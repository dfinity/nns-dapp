//! Caller checks for the methods that only a controller may call.

#[cfg(test)]
pub mod test_api;

#[cfg(test)]
use test_api::{caller_is_controller, deny};

/// The message that a controller-only method traps with.
pub const CALLER_IS_NOT_A_CONTROLLER: &str = "Only a controller of this canister may call this method.";

/// Traps unless a controller of this canister made the current call.
pub fn assert_caller_is_controller() {
    if !caller_is_controller() {
        deny(CALLER_IS_NOT_A_CONTROLLER);
    }
}

/// Returns `true` if a controller of this canister made the current call.
///
/// A caller gets the list of controllers from
/// `agent.read_state_canister_info(canister_id, "controllers")`.
#[cfg(not(test))]
fn caller_is_controller() -> bool {
    ic_cdk::api::is_controller(&ic_cdk::api::msg_caller())
}

/// Stops the current call with an error message.
#[cfg(not(test))]
fn deny(message: &str) -> ! {
    ic_cdk::api::trap(message)
}
