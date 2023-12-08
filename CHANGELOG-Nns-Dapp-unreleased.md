# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

* Sns dynamic voting proportions.
* Iterator over AccountsDbs.
* Display expiration date for sns proposals.
* Neuron type support.
* Card with BTC deposit address and QR code in ckBTC wallet.
* Merge Approve transfer with BTC "Sent" transaction in transaction list.

#### Changed

* Render BTC deposits/withdrawals as "BTC Received"/"BTC Sent".
* Update Rust version: `1.74.0` -> `1.74.1`

#### Deprecated

#### Removed

#### Fixed

#### Security

* Bump css-tools dev dependency to fix minor vulnerability.

#### Not Published

### Operations

#### Added

#### Changed

#### Deprecated

#### Removed

* Remove `.gitattributes`.

#### Fixed

* Provide missing global config in cache-filling workflow.
* Update the correct flavour of golden file when the NNS Dapp canister API changes.

#### Security
