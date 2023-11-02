# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

* Added provenance information to .did files and derived rust code.
* Add `UpdateElectedHostosVersions` and `UpdateNodesHostosVersion` proposals support.
* Show the maximum participation of the Neurons' Fund when present.
* A list of exceptional (not-rendered, zero value) transactions.

#### Changed

* Stable structures updated to `0.6.0`.
* Dapp upgraded to Svelte `v4`.
* New Proposal Card.
* Change the slider in dissolve delay for a read-only progress bar.
* Redesign the proposal payload and action.

#### Deprecated
#### Removed

* Removed debounce on deriving Network from ckBTC send address.

#### Fixed

* Remove robots meta tag to allow search engines to crawl NNS Dapp.
* Fix i18n key in merge neurons summary screen.
* Display `TransferFrom` as a normal receive instead of failing to load transactions.
* Fix issue with setting max dissolve delay when max is not a whole day.

#### Security

#### Not Published

* Added `retrieveBtcWithApproval` in ckbtc-minter API.
* Render Approve transactions in transaction list.
* Add feature flag `ENABLE_CKBTC_ICRC2`.

### Operations

#### Added

* Import candid for NNS ledger.
* Formatting for `Cargo.toml` files.
* Add test to check that the nns-dapp cargo and npm versions match.
* Script to deploy nns-dapp on DevEnv.

#### Changed

* Stop updating candid files when updating the test environment.
* Join npm audit URLs with spaces instead of commas.
* Add traits with a dedicated command rather than with patch files.
* Use snsdemo snapshot with Internet Identity version 2023-10-27.

#### Deprecated
#### Removed

* Delete nightly `GitHub` job to update II used in tests; we now use the II that comes with `snsdemo`.

#### Fixed

#### Security
