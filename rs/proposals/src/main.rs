use ic_nns_governance::pb::v1::ProposalInfo;
use proposals as lib;
use std::io::{self, Read};

/// Reads hex from `stdin`, as provided by `canister call --output raw`, and writes JSON to `stdout`.
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
