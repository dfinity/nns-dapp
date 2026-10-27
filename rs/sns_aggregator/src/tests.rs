//! Tests for the API methods of the aggregator canister.
#![allow(clippy::unwrap_used)]

use crate::auth::assert_caller_is_controller;
use crate::auth::test_api::set_caller_and_controllers;
use crate::state::Config;
use candid::Principal;

/// A principal that controls the canister in a test.
fn controller() -> Principal {
    Principal::from_text("qsgjb-riaaa-aaaaa-aaaga-cai").unwrap()
}

/// A principal that does not control the canister in a test.
fn other_principal() -> Principal {
    Principal::from_slice(&[1, 2, 3, 4])
}

#[test]
fn assert_caller_is_controller_accepts_a_controller() {
    set_caller_and_controllers(controller(), &[controller()]);
    assert_caller_is_controller();
}

#[test]
#[should_panic(expected = "Only a controller of this canister may call this method.")]
fn assert_caller_is_controller_rejects_another_principal() {
    set_caller_and_controllers(other_principal(), &[controller()]);
    assert_caller_is_controller();
}

#[test]
#[should_panic(expected = "Only a controller of this canister may call this method.")]
fn assert_caller_is_controller_rejects_the_anonymous_principal() {
    set_caller_and_controllers(Principal::anonymous(), &[controller()]);
    assert_caller_is_controller();
}

/// The trap message proves that `reconfigure` stops at the caller check, before
/// it reaches `setup` and the timers.
#[test]
#[should_panic(expected = "Only a controller of this canister may call this method.")]
fn reconfigure_rejects_another_principal() {
    set_caller_and_controllers(other_principal(), &[controller()]);
    crate::reconfigure(Some(Config {
        update_interval_ms: 0,
        fast_interval_ms: 0,
    }));
}

#[test]
#[should_panic(expected = "Only a controller of this canister may call this method.")]
fn reconfigure_rejects_the_anonymous_principal() {
    set_caller_and_controllers(Principal::anonymous(), &[controller()]);
    crate::reconfigure(None);
}

/// Returns the `Config` that the canister stores now.
fn stored_config() -> Config {
    crate::STATE.with(|state| state.stable.borrow().config.borrow().clone())
}

#[test]
fn apply_config_raises_an_interval_that_the_caller_set_too_short() {
    let raised = crate::apply_config(Some(Config {
        update_interval_ms: 0,
        fast_interval_ms: 0,
    }));
    assert!(raised, "The intervals should have been raised");
    assert_eq!(stored_config().update_interval_ms, Config::MIN_INTERVAL_MS);
    assert_eq!(stored_config().fast_interval_ms, Config::MIN_INTERVAL_MS);
}

#[test]
fn apply_config_keeps_an_interval_that_is_long_enough() {
    let raised = crate::apply_config(Some(Config {
        update_interval_ms: 1_000,
        fast_interval_ms: 2_000,
    }));
    assert!(!raised, "The intervals should have been kept");
    assert_eq!(stored_config().update_interval_ms, 1_000);
    assert_eq!(stored_config().fast_interval_ms, 2_000);
}

#[test]
fn apply_config_raises_a_short_interval_that_is_already_stored() {
    crate::STATE.with(|state| {
        state.stable.borrow().config.borrow_mut().update_interval_ms = 0;
    });
    let raised = crate::apply_config(None);
    assert!(raised, "The stored interval should have been raised");
    assert_eq!(stored_config().update_interval_ms, Config::MIN_INTERVAL_MS);
}
