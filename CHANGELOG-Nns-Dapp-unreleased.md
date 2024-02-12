
# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

* Add fee as mandatory when making ICP transactions.
* Add the token symbol in the send modals.
* Add new boundary node proposals support.
* Prevent the `1Password` extension from appearing in input fields.
* Support HTML within toast messages.
* Add `ENABLE_VOTING_INDICATION` feature flag.
* Add "Manage Internet Identity" and "Source code" entries to account menu.
* Client side caching of SNS Aggregator calls.

#### Changed

* Stable memory is owned by State structure to control access.
* Voting power calculation formatting.
* Voting rewards description.
* Unify implementations of SNS token wallets with other (non-ICP) token wallets.
* Refactor tokens store usage.

#### Deprecated

#### Removed

* Unused `i18n` messages.
* Remove `ENABLE_MY_TOKENS` feature flag.
* Stop loading SNS tokens individually because they are already loaded from the SNS aggregator data.

#### Fixed

* QR-code reader incorrectly mirrored on `Samsung S23`.
* Check SNS neuron balances to claim pending neurons.
* Neurons that can vote being displayed as ineligible on the SNS proposal detail page.

#### Security

#### Not Published

### Operations

#### Added

* Check for unused i18n messages.

#### Changed

* Update the GitHub `build-push-action` from `v4` to `v5`.
* Upgrade Rust to 1.76.0

#### Deprecated

#### Removed

#### Fixed

#### Security
