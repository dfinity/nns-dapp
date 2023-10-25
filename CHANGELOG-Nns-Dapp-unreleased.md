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
* Add `UpdateElectedHostosVersions` and `UpdateNodesHostosVersion` proposals support.
* Show the maximum participation of the Neurons' Fund when present.

#### Changed

* Stable structures updated to `0.6.0`.
* Dapp upgraded to Svelte `v4`.

#### Deprecated
#### Removed

#### Fixed

* Remove robots meta tag to allow search engines to crawl NNS Dapp.
* Fix i18n key in merge neurons summary screen.

#### Security

#### Not Published

* Added `retrieveBtcWithApproval` in ckbtc-minter API.

### Operations

#### Added

* Documentation for the proposals payload renderer.
* E2E test for ckBTC.
* Fix erroneous failures in the `tip` tagging workflow when a PR is closed without merging.
* Add --host flag to dfx-snapshot-start.
* Script to deploy nns-dapp on DevEnv.
* Formatting for `Cargo.toml` files.
* Add test to check that the nns-dapp cargo and npm versions match.

#### Changed

* Join npm audit URLs with spaces instead of commas.
* Add traits with a dedicated command rather than with patch files.

#### Deprecated
#### Removed

* Delete nightly `GitHub` job to update II used in tests; we now use the II that comes with `snsdemo`.

#### Fixed

#### Security
