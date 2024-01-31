use ic_cdk::println;
use lib::canisters::nns_governance::api::ProposalInfo;
use proposals as lib;
use std::io::{self, Read};

/// Reads hex from `stdin`, as provided by `canister call --output raw`, and writes JSON to `stdout`.
///
/// For example, to render the payload of proposal 124999, you could run:
/// ```
/// dfx canister call nns-governance --network ic get_proposal_info "(124999 : nat64)" --query --output raw | cargo run --bin proposals
/// ```
fn main() {
    let mut idl_str = String::new();
    io::stdin()
        .read_to_string(&mut idl_str)
        .expect("Failed to read string from stdin");
    let idl_bytes = hex::decode(idl_str.trim()).expect("Invalid hex");
    let (idl_args,): (Option<ProposalInfo>,) = candid::decode_args(&idl_bytes).expect("Malformed input");
    let idl_args = idl_args.expect("Missing ProposalInfo");

    let json_str = lib::process_proposal_payload(idl_args);
    println!("{json_str}");
}
