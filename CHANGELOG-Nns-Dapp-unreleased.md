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

#### Deprecated

#### Removed

#### Fixed

#### Security

- The "Hide Balance" option now also masks the balances in the accessible names
  on the Portfolio page. Before, the cards kept the exact amounts in their
  `aria-label` attributes, so a screen reader announced them.

- Read the SNS swap participant count only from the certified swap canister
  state. Before, a swap without that field read the count from the unverified
  raw metrics page.

#### Not Published

### Operations

#### Added

#### Changed

#### Deprecated

#### Removed

#### Fixed

#### Security
