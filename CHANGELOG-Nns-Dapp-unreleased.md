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

- Warn the user to check the balance when a transaction outcome is unknown, instead of reporting a failure.
- Prevent a double payment when the user repeats a transaction with an unknown outcome.

#### Security

#### Not Published

### Operations

#### Added

#### Changed

- The local test network submits all SNS proposals before it waits for the
  swaps to open, so it starts faster.
- The upgrade proposal has a short title with the short commit hash. The commit
  and the Wasm hash are in the "Wasm Verification" section.

#### Deprecated

#### Removed

#### Fixed

#### Security
