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

- Increase the maximum canister name length from 24 to 64 characters.

#### Deprecated

#### Removed

#### Fixed

#### Security

- Remove all voting permissions when a user removes an SNS neuron hotkey. The removal kept `ManageVotingPermission`, so the removed principal could grant the permissions back. The hotkey list now also shows a principal that keeps some voting permissions. After the removal, the dapp reads the certified neuron and reports a permission that remains.

#### Not Published

- Update the TESTNET permissions card when the neuron changes. The card read the neuron once, so it showed stale data.

### Operations

#### Added

#### Changed

#### Deprecated

#### Removed

#### Fixed

#### Security
