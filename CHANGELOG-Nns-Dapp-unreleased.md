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

* New icons for sent/received transactions.

#### Deprecated

#### Removed

#### Fixed

* Add missing "Rename" button in the subaccount page.
* Fix disappearing "Received" half of to-self transactions.
* Fix debug store that wasn't working.

#### Security

#### Not Published

### Operations

#### Added

* Add a workflow to update the SNS aggregator bindings regularly.
* Added support for global network config.
* Cron job to update proposal types.
* Enable dependabot for Rust updates.
* Workflow to get the latest NNS and SNS canister candid files.
* Try to prevent calls to global.fetch in unit tests.
* Add `devenv_llorenc` and `devenv_dskloet` to list of networks.

#### Changed

* Update `ic-wasm` to the latest version.
* Factor out the `snsdemo` installation.
* Make the location of the snsdemo checkout configurable.
* Add `prod` and `aggregator-prod` to the list of public releases.
* Update `dfx` to `v0.15.1`.
* Use a unique branch when updating the snsdemo release, didc, IC candid files or rust.
* Use a unique branch when updating the snsdemo release.

#### Deprecated

#### Removed

#### Fixed

* Remove accidentally committed (empty) directory and fix commit patterns.

#### Security
