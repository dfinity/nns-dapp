# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

* Added `get_tvl` method to `nns-dapp` canister.
* Display of principal Id and main ICP account Id in the account menu.

#### Changed

* Changes for cleaning up the stable structure migration.
* Move Canisters button from sidebar to account menu.
* Move GitHub button from account menu to sidebar.
* Reduce calls to `sns-governance` canister by getting `nervous_system_parameters` from the aggregator instead.
* Upgrade frontend dev dependencies (SvelteKit v2, vite, vitest, etc.)

#### Deprecated

#### Removed

#### Fixed

* Fixed a bug where a performance counter in `init` is wiped during state initialization.

#### Security

#### Not Published

### Operations

#### Added

#### Changed

#### Deprecated

#### Removed

* Removed unused `pocket-ic` dependency.

#### Fixed

#### Security
