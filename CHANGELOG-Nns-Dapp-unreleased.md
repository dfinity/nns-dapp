# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

* Render withdrawal address on ckBTC burn transactions.

#### Changed

* New icons for sent/received transactions.
* Increase the pre-migration account limit.
* Use "From:" instead of "Source:" for received transactions.

#### Deprecated

#### Removed

#### Fixed

* Fix docker builds when there is no global config.
* Add missing "Rename" button in the subaccount page.
* Fix disappearing "Received" half of to-self transactions.
* Fix debug store that wasn't working.
* Fix the stuck loading issue with the Sns proposal.
* Fix "Expiration date" countdown label visibility.

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
* Update Rust to the latest stable version (1.74.0).
* Add `prod` and `aggregator-prod` to the list of public releases.
* Update `dfx` to `v0.15.1`.
* Update the URL of the app subnet to what dfx v15 expects.
* Use a unique branch when updating the snsdemo release, didc, IC candid files or rust.
* Better checks that the network is defined.
* Move the commands that derive aggregator code from NNS candid files.
* Better text for rust update PRs.

#### Deprecated

#### Removed

* References to static testnets.

#### Fixed

* Remove accidentally committed (empty) directory and fix commit patterns.
* Fix local deployments with `dfx 0.15.1`.

#### Security
