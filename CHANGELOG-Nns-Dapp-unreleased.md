
# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

* Add `ENABLE_VOTING_INDICATION` feature flag.
* Add "Manage Internet Identity" and "Source code" entries to account menu.
* Client side caching of SNS Aggregator calls.
* Prompt the user to check the hardware wallet screen when splitting a neuron controlled by one.

#### Changed

* Refactor tokens store usage.

#### Deprecated

#### Removed

* Stop loading SNS tokens individually because they are already loaded from the SNS aggregator data.
* Remove `ENABLE_SNS_TYPES_FILTER` feature flag.

#### Fixed

#### Security

#### Not Published

### Operations

#### Added

* Test that project logo (not token logo) is displayed on SNS wallet.

#### Changed

* Update the GitHub `build-push-action` from `v4` to `v5`.
* Upgrade Rust to 1.76.0
* Ignore failures of `test-upgrade-map`

#### Deprecated

#### Removed

* Remove periodic app subnet deployment of nns-dapp.

#### Fixed

#### Security
