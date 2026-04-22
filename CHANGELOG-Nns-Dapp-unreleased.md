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

- Bump `@icp-sdk/canisters` to `3.5.2-next-2026-04-21.1` and consume
  `eightYearGangBonusBaseE8s`.

#### Deprecated

#### Removed

- Drop hard-coded Mission 70 overrides for `governanceMetrics.totalSupplyIcp`
  and `nnsTotalVotingPower` in `+layout.svelte`; values now come from the
  stores populated by the NNS governance canister.

#### Fixed

- Fixed dissolve delay showing incorrect hours (e.g. "2 years, 12 hours" now correctly displays as "2 years").

#### Security

#### Not Published

### Operations

#### Added

#### Changed

#### Deprecated

#### Removed

#### Fixed

#### Security
