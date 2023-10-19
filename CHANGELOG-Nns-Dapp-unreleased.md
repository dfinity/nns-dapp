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
* Added `approveTransfer` in icrc-ledger API.

#### Changed

* Update proposal info icons position to improve the UX.
* Improve the indicator of the minimum commitment in the project status.
* Dapp upgraded to Svelte v4.

#### Deprecated
#### Removed

#### Fixed

* Add "Finalizing" status in projects of the Launchpad.
* Fix UI bug when commitment was very low.

#### Security

#### Not Published

* New feature flag `ENABLE_MY_TOKENS`.
* Detailed values of the Neurons' Fund and direct participation in the project detail page.
* Added `approveTransfer` in icrc-ledger API.
* Added `retrieveBtcWithApproval` in ckbtc-minter API.

### Operations

#### Added

* Documentation for the proposals payload renderer.
* E2E test for ckBTC.
* Fix erroneous failures in the `tip` tagging workflow when a PR is closed without merging.
* Add --host flag to dfx-snapshot-start.

#### Changed

* Migrate the Jest unit test suite to Vitest.

#### Deprecated
#### Removed

#### Fixed

#### Security
