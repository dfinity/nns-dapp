# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

* Sns dynamic voting proportions.
* Iterator over AccountsDbs.
* Display expiration date for sns proposals.
* Neuron type support.
* Card with BTC deposit address and QR code in ckBTC wallet.
* Merge Approve transfer with BTC "Sent" transaction in transaction list.
* Display Neurons' Fund commitment progress bar.
* `range()` method to `AccountsDbTrait`.
* Render ckBTC Reimbursement transactions.

#### Changed

* Render BTC deposits/withdrawals as "BTC Received"/"BTC Sent".
* Update Rust version: `1.74.0` -> `1.74.1`
* Provide space for migration state in the `ProxyDb`.
* Rename "Launch Pad" to "Launchpad".
* Use `ic_cdk::println` instead of the `dfn_core` equivalent.

#### Deprecated

#### Removed

#### Fixed

* Limit the size of proposal payload rendering errors, as otherwise the error can become too large to return.
* Provide a fallback if proposal payloads don't have the expected type.
* Temporary work-around for broken SNS.

#### Security

* Bump css-tools dev dependency to fix minor vulnerability.

#### Not Published

### Operations

#### Added

#### Changed

* Allow npm greater than v10 in frontend project.
* Apply clippy only to target `wasm32-unknown-unknown` but prohibit `std::println` and variants for that target.

#### Deprecated

#### Removed

* Remove `.gitattributes`.

#### Fixed

* Provide missing global config in cache-filling workflow.
* Update the correct flavour of golden file when the NNS Dapp canister API changes.
* Specify the node version to use in the version bump test.
* Summarize the `AccountsStore` contents in its `Debug` representation rather than trying to print its entire contents.
* Lock the spellcheck version and its dependencies.
* Keep `dfx start` logs in CI.
* Let canister IDs provided by the dfx cli override fixed canister IDs in config files.  Needed for local deployments.

#### Security
