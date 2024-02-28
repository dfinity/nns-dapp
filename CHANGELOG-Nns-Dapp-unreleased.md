
# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

* Add `ENABLE_ICP_INDEX` feature flag.

#### Changed

* Minor wording and style changes on the neuron detail page.

#### Deprecated

#### Removed

* Remove functionality to add pending swap transactions in NNS Dapp canister.

#### Fixed

* Bug where transferred SNS neurons appeared in the list of neurons after transferring them.

#### Security

#### Not Published

### Operations

#### Added

* Dependabot configuration to update GitHub actions.
* Add `NNS_INDEX_CANISTER_ID` to the configuration.

#### Changed

* Upgraded `ic-js` dependencies to utilize `agent-js` patched version `v1.0.1`.

#### Deprecated

#### Removed

#### Fixed

* Adapted Dockerfile to the new `dfx` installation procedure:
  * Added `/root/.local/share/dfx/bin` to `PATH`.
  * When installing `dfx`, set a new environment variable: `DFXVM_INIT_YES=true`

#### Security
