
# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

* Tooltip with exact voting power in voting card.
* Message informing about proposal topic changes.

#### Changed

* Sort neurons by decreasing dissolve delay when stakes are equal.
* Make the progress bar on the swap page straight instead of rounded.
* Rename some topics and proposal types.

#### Deprecated

#### Removed

* Deprecate the feature flag `ENABLE_ICP_INDEX`.
* Removed `get_transactions` method from nns-dapp canister.

#### Fixed

* Fixed duplicate tooltip IDs to be unique.
* Redirect to accounts page after signing in on wallet page with incorrect account identifier.
* Make sure `IdentifierHash` uses a unique `id` and `aria-describedby` attribute.
* Place tooltip in document body to avoid overflow issues.
* Align "Nervous System" and universe title on the neurons tab.

#### Security

#### Not Published

### Operations

#### Added
* Added a test that stats are not recomputed on upgrade but rather serialized and de-serialized.

#### Changed

#### Deprecated

#### Removed

#### Fixed

#### Security
