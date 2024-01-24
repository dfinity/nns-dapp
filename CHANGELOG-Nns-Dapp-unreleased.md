
# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

* New block "Stake a neuron" on proposal details page.
* Getter and setter of partition schema label.

#### Changed

* Changed wording about staking neurons to staking tokens.
* Add missing feature flags to default feature flags value.
* Various wording changes.
* Various wording changes.

#### Deprecated

#### Removed

* ckBTC withdrawal account.
* Don't show the red error outline on dissolve delay input when the dissolve delay is not enough to have voting power.

#### Fixed

* Fix gaps between sections on the mobile launchpad page.
* Fix proposal back navigation during voting.

#### Security

#### Not Published

### Operations

#### Added

* Add `reviewers` to the `update-*.yml` workflows that create PRs.

#### Changed

#### Deprecated

#### Removed

#### Fixed

* Commented out broken local `config.test`.

#### Security
