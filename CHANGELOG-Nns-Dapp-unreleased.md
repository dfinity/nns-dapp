# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

- Make the NNS dapp discoverable by AI agents, also through ICP MCP.

#### Changed

* Connect to the Ledger device through the Ledger Device Management Kit. It

#### Deprecated

#### Removed

#### Fixed

- No error toast when the SNS aggregator has no project.
- The staking rewards and the APY load when there is no SNS project.
- The canister page tells a user that they are not a controller also when the
  Internet Computer answers with the newer error code IC0542.

#### Security

#### Not Published

### Operations

#### Added

#### Changed

- The local test network, for development and CI, runs on icp-cli instead of
  dfx and the snsdemo snapshot. The network has no SNS project, no ckBTC and no
  test token, so the end-to-end tests that need them are skipped.
- The local test network has a mock of the ICP Swap price feed, so the app
  shows token prices and the staking rewards.

#### Deprecated

#### Removed

#### Fixed

#### Security
