
# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

* Setting to hide tokens with zero balance.

#### Changed

* Always omit the account parameter in the URL when navigating to a main account.
* Display the block timestamp instead of created timestamp on ICP transaction.
* Minor style changes for mobile project selector.

#### Deprecated

#### Removed

* Remove `protobuf` dependency for Ledger hardware wallet.

#### Fixed

* Make token table rows always clickable. A few edge cases were missing.
* Don't require double hardware approval on neuron staking.

#### Security

#### Not Published

* Hide tokens with zero balance based on setting behind feature flag.

### Operations

#### Added

#### Changed

#### Deprecated

#### Removed

#### Fixed

* Reinstall xz in reproducible assets workflow to get consistent archives.

#### Security
