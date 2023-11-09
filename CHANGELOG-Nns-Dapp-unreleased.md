# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

* Add a link to the ICP Dashboard in the project detail page.
* Add collapse-all functionality to json tree view.

#### Changed

* Read schema version from stable memory.
* New icons for sent/received transactions.

#### Deprecated

#### Removed

#### Fixed

* Show canister title in details when user is not the controller.
* Add missing "Rename" button in the subaccount page.

#### Security

#### Not Published

* Use ICRC-2 for BTC withdrawal when `ENABLE_CKBTC_ICRC2` is enabled.

### Operations

#### Added

* Cron job to update proposal types.
* Enable dependabot for Rust updates.
* Workflow to get the latest NNS and SNS canister candid files.
* Try to prevent calls to global.fetch in unit tests.
* Add `devenv_llorenc` and `devenv_dskloet` to list of networks.

#### Changed

* Update `ic-wasm` to the latest version.
* Factor out the `snsdemo` installation.
* Add `prod` and `aggregator-prod` to the list of public releases.
* Use a unique branch when updating the snsdemo release, didc, IC candid files or rust.

#### Deprecated

#### Removed

* No longer update rust bindings when NNS canister interfaces are updated.

#### Fixed

#### Security
