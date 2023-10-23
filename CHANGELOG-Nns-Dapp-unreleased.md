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
* Add `UpdateElectedHostosVersions` and `UpdateNodesHostosVersion` proposals support

#### Changed

* Dapp upgraded to Svelte v4.

#### Deprecated
#### Removed

#### Fixed

* Remove robots metatag to allow search engines to crawl NNS Dapp.

#### Security

#### Not Published

* Added `retrieveBtcWithApproval` in ckbtc-minter API.

### Operations

#### Added

* Formatting for `Cargo.toml` files.
* Add test to check that the nns-dapp cargo and npm versions match.

#### Changed

* Add traits with a dedicated command rather than with patch files.

#### Deprecated
#### Removed

#### Fixed

#### Security
