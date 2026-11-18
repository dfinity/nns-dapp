# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

- ckSOL is listed as a default token.
- Add an "Import SNS" tool to the quick search panel to add an SNS that the
  NNS dapp does not list.
- Add a Hotkeys page to replace or remove a hotkey on all your NNS and SNS neurons at once.

#### Changed

#### Deprecated

#### Removed

#### Fixed

- Warn the user to check the balance when a transaction outcome is unknown, instead of reporting a failure.
- Prevent a double payment when the user repeats a transaction with an unknown outcome.
- In a tool of the quick search panel, the Enter key no longer opens the first
  search result.
- Screen readers can now read and use the quick search panel.
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
- The local test network has a ckRED test token, so the import token
  end-to-end tests run again.
- The local test network has four SNS projects, created through NNS proposals,
  so the SNS end-to-end tests run again.
- The local test network has a mock exchange rate canister, so the total value
  locked works and its test runs again.
- The release script deploys the release candidate to the devenv only with
  `--devenv`, and the Slack links are optional.

#### Deprecated

#### Removed

#### Fixed

#### Security
