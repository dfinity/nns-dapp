
# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

#### Changed

* Load ICP transactions from ICP index canister instead of nns-dapp.
* More readable error messages if `assert_eq` fails in tests.
* Order neurons from highest to lowest stake on the neurons page.
* Main navigation text changes.
* Minor text changes.
* Main menu icons and style changes.

#### Deprecated

#### Removed

#### Fixed

#### Security

#### Not Published

### Operations

#### Added
* Added a test that stats are not recomputed on upgrade but rather serialized and deserialized.

#### Changed

#### Deprecated

#### Removed

#### Fixed

* Make `JestPageObjectElement.selectOption` work with fake timers.

#### Security
