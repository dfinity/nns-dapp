
# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

* Make neurons table sortable on desktop and mobile.
* A short delay before closing the mobile table sorting modal.

#### Changed

* Change neuron ID column title to "Neurons".
* Excluded non-displayed empty neurons when loading neurons.
* Transactions to neuron accounts are now displayed as "Sent" instead of "Staked" or "Top-up neuron" if the neuron is no longer displayed because it's disbursed or merged.
* Change the color of the settings icon on the tokens table.

#### Deprecated

#### Removed

* Disable sorting the neurons table by neuron ID.
* Remove default topic and proposal status filters.

#### Fixed

* Button disable state glitch when voting with neurons where one follows another.

#### Security

#### Not Published

### Operations

#### Added

* Script to convert between ID formats

#### Changed

#### Deprecated

#### Removed

#### Fixed

#### Security
