
# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

* Close button at the bottom of follow neurons modal.
* Info tooltips in neuron details.
* Use logo for token (if present) for `ICRC` (but non-`SNS`) tokens.
* Add the token symbol in the receive modal.

#### Changed

* Various wording changes.
* Display the full neuron type text within the tag.
* Implement `State` traits manually rather than automatically.

#### Deprecated

#### Removed

* Remove `ENABLE_CKETH` feature flag.
* Remove unused `transactionsFeesStore` and related.

#### Fixed

* Fix proposal back navigation during voting.
* Fix tooltip positioning.
* Tooltip icon style.

#### Security

#### Not Published

### Operations

#### Added

* Add `.orig` file extension to `.gitignore` file.

#### Changed

* Frequency of update workflows moved to weekly instead of daily.

#### Deprecated

#### Removed

#### Fixed

#### Security
