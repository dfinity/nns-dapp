# How to add/change proposal

## Update labels

- add `NnsFunction` id in `@dfinity/nns/.../governance.enums.d.ts`
- update labels in `nns_functions` (could be managed by dashboard team)
  - `nns_functions`
  - `nns_functions_description`
- update

## Update proposal payload definition

- In `Cargo.toml` update the rev using the latest `Bless Replica Version`
- In case of new proposal type
  - If needed add the dependency (e.g. "ic-sns-swap") in the Cargo.toml (because the new proposal type is executed by
    new canister)
  - Add new payload type (e.g. `AddWasmRequest`) in `proposals.rs`
  - If the payload needs to be transformed for display (e.g. if it is too large), define the type into which the
    payload must be transformed, then implement `From<OriginalPayloadType` for this new type.
    (see `NNS function 3 - AddNNSCanister`) (use `Trimmed` suffix to define transformed version)
  - Update the `match nns_function` expression to include the new function (use either identity or transform depending
    on if the payload needs to be transformed).
- Build: `cargo build`
- deploy and test on available proposals
