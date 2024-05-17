
# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

* Close modal on ESC key press.
* Add `ENABLE_ACTIONABLE_TAB` feature flag.
* Support `ApiBoundaryNodes` in `FirewallRulesScope` of `AddFirewallRulesPayload`.
* Support `SubnetRental` topic.
* Support NNS function 52 for `SubnetRentalRequest`.
* Get `ckUSDC` canister IDs from environment/configuration.

#### Changed

* Update IC, Candid, and `ic-cdk` dependencies.
* Changed support for NNS function 43 from `AddApiBoundaryNodePayload` (singular) to `AddApiBoundaryNodesPayload` (plural).
* Set `Actionable Proposals` as the default selection.

#### Deprecated

#### Removed

* Stop encoding the accounts map in the `AccountsStore`.
* Removed `ENABLE_HIDE_ZERO_BALANCE` feature flag.
* Proposal filtering by reward status.
* Intermediate step to remove transactions from accounts stored in nns-dapp.

#### Fixed

* Successful swap message should not be shown when participant count is insufficient.
* Rendering tokens with fewer than 8 decimals.
* Don't allow inputting more decimals than the token supports.

#### Security

#### Not Published

* Support `ckUSDC` behind a feature flag.

### Operations

#### Added

* Added workflow to update IC cargo dependencies.
* Include `ckUSDC` when generating `args.did` and `.env`.
* Include `ckUSDC` canister IDs when importing from URL with `scripts/canister_ids`.

#### Changed

* In `migration-test`, also populate some accounts between upgrade and downgrade.
* Update `dfx` version from 0.15.3 to 0.19.0.

#### Deprecated

#### Removed

#### Fixed

#### Security
