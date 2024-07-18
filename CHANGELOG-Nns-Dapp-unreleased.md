
# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

* A short delay before closing the mobile table sorting modal.

#### Changed

* Reduce the frequency of checking if SNS neurons need to be refreshed.
* New token table order. 
* Update nns-dapp icons for consistent style and line thickness.

#### Deprecated

#### Removed

* Remove default topic and proposal status filters.
* Remove old canister creation/top-up mechanism that hasn't been used for 2 years.

#### Fixed

* Button disable state glitch when voting with neurons where one follows another.
* Fix "the current proposals response is too large" error on proposals page.
* Visibility of "Neuron Management" proposals in actionable list.
* Fix "Show neurons" for hardware wallet.
* HTML injection in error toast.

#### Security

#### Not Published

### Operations

#### Added

* Script to convert between ID formats
* Test cycles minting canister notification mechanism of the nns-dapp.

#### Changed

#### Deprecated

#### Removed

* Deleted Reproducible Assets workflow.

#### Fixed

#### Security
