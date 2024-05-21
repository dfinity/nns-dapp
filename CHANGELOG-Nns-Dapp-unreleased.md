
# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

* Get `ckUSDC` canister IDs from environment/configuration.

#### Changed

* Set `Actionable Proposals` as the default selection.

#### Deprecated

#### Removed

* Stop writing account transactions to stable memory.

#### Fixed

* Rendering tokens with fewer than 8 decimals.
* Don't allow inputting more decimals than the token supports.

#### Security

#### Not Published

* Support `ckUSDC` behind a feature flag.

### Operations

#### Added

* Include `ckUSDC` when generating `args.did` and `.env`.
* Include `ckUSDC` canister IDs when importing from URL with `scripts/canister_ids`.

#### Changed

#### Deprecated

#### Removed

#### Fixed

#### Security
