//! Code for testing arguments
use candid::Decode;
use ic_cdk::println;
use nns_dapp::arguments::CanisterArguments;
use std::env::args;
use std::fs;

/// Simple utility to check that Rust can parse the binary arguments.
fn main() {
    let path = args().nth(1).expect("No path provided");
    println!("Checking binary arguments at: {path}");
    let bytes = fs::read(path).expect("Failed to read path");
    let arg = Decode!(&bytes, Option<CanisterArguments>).expect("Binary is not valid candid");
    println!("Parsed as:\n{arg:#?}");
    // The canister makes the same check at install time.  It traps if the check fails.
    if let Some(arg) = &arg {
        arg.validate().expect("Arguments are not safe to put in a page");
    }
}
