# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

* Enable ICRC-2 flow for BTC withdrawal.
* Add ENABLE_CKETH feature flag.
* Get ckETH canister IDs from environment/configuration.

#### Changed

#### Deprecated

#### Removed

* Remove the `ENABLE_FULL_WIDTH_PROPOSAL` feature flag.

#### Fixed

* Fix swallowed undefined fields in raw json view. 

#### Security

#### Not Published

### Operations

#### Added

* Experimental tests for schema migration.
* Add optional version support to the storage records.
* Include ckETH canister IDs when importing from URL with `scripts/canister_ids`.
* Include ckETH when generating args.did and .env.

#### Changed

* Adapt `release-sop` script to work with DevEnv instead of staging.

#### Deprecated

#### Removed

#### Fixed

#### Security
