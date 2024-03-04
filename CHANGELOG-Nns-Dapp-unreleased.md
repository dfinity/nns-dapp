
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

* Refactored `icpAccountsStore` to be derived from separate stores.

#### Deprecated

#### Removed

* Removed unreleased feature flag `ENABLE_ICP_ICRC`.

#### Fixed

* Don't reload transactions multiple times when closing the receive modal.

#### Security

#### Not Published

### Operations

#### Added

* Notify the maintainers if the docker build is not reproducible.

#### Changed

* Disambiguated the title of the docker reproducibility check.
* Change the number of accounts tested in `test-upgrade-map-stable` from 1000 to 20.
* Andrew will be making the release forum posts.

#### Deprecated

#### Removed

#### Fixed

* Adapted the docker reproducibility test to work with `upload-artifact@v4`.

#### Security
