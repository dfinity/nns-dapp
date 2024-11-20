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

* Claim unclaimed neurons from the frontend instead of the backend.
* Update proposal status colors.

#### Deprecated

#### Removed

* Stop storing neuron accounts in the nns-dapp canister.

#### Fixed

* Stop trying to get swap commitments from aborted SNSes.
* Stop making unnecessary calls to SNS-W and SNS root canisters.
* User gets the wrong identity when connecting different hardware wallets devices in a certain order.
* Fix candid decoding error of stable memory.
* Show successfully loaded swap commitments even if some fail to load.

#### Security

#### Not Published

### Operations

#### Added

#### Changed

#### Deprecated

#### Removed

#### Fixed

#### Security
