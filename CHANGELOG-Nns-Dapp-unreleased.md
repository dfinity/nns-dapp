
# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

* Add new proposal types support (47-51)
* Message informing about proposal topic changes.
* Tooltips with exact voting power on voted neurons.

#### Changed

* Update IC dependencies in nns-dapp crates.
* Update `ic-stable-structures` dependency to 0.6.4.
* New main menu selection style.
* Rename some topics and proposal types.

#### Deprecated

#### Removed

* Stop storing transactions in the nns-dapp canister.
* Removed metrics that were derived from transactions stored in the canister.

#### Fixed

* Inconsistency in similar Nns neuron sorting.
* Adjust Metrics block visibility for certain screen widths.

#### Security

#### Not Published

### Operations

#### Added

* Added `upgrade-downgrade-test` script.

#### Changed

#### Deprecated

#### Removed

#### Fixed

#### Security
