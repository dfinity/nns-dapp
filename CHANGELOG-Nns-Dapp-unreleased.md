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

- Compute per-neuron APY as an annualized rate over the days the neuron is actually eligible to vote, with a pool-decay correction factor (`fullPoolSum / eligiblePoolSum`). For locked neurons the correction collapses to 1 and the displayed APY is unchanged from before. Dissolving neurons that previously displayed a near-zero APY (because the post-eligibility tail dragged the 365-day average toward 0) now display the rate at which they're actually earning during dissolution. The project total APY follows the same methodology: it is the stake-weighted average of the per-neuron annualized APYs (bank-style), rather than the simulated reward over the full year divided by stake.

#### Deprecated

#### Removed

#### Fixed

#### Security

#### Not Published

### Operations

#### Added

- Add `sns.internetcomputer.org` to the list of supported domains.

#### Changed

#### Deprecated

#### Removed

- Remove `wallet.internetcomputer.org` and `wallet.ic0.app` from the list of supported domains.

#### Fixed

#### Security
