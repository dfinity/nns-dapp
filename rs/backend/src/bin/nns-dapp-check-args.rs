//! Code for testing arguments
use candid::Decode;
use nns_dapp::arguments::CanisterArguments;
use std::env::args;
use std::fs;

/// Simple utiliyty to check that Rust can parse the binary arguments.
fn main() {
    let path = args().skip(1).next().expect("No path provided");
    println!("Checking binary arguments at: {path}");
    let bytes = fs::read(path).expect("Failed to read path");
    let arg = Decode!(&bytes, Option<CanisterArguments>).expect("Binary is not valid candid");
    println!("Parsed as:\n{arg:#?}");
}
