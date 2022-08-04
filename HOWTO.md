## Update proposal payload definition

- In `Cargo.toml` update the rev using the latest `Bless Replica Version`
- In case of new proposal type
  - Add a dependency (e.g. "ic-sns-wasm") in the Cargo.toml (because the new proposal type is executed by new canister)
  - Add new payload type (e.g. `AddWasmRequest`) in `proposals.rs`
  - Update `transform` if needed (see `NNS function 3 - AddNNSCanister`) (use `Trimmed` suffix to define transformed version)
  - Update `match nns_function` match statement
- Build: `cargo build`
- deploy and test on available proposals
