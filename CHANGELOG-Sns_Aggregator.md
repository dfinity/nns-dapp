# Changelog SNS Aggregator

All notable changes to the SNS Aggregator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The SNS Aggregator is released through proposals in the Network Nervous System. Therefore, each proposal is documented below, following the relevant changes.

## Unreleased

### Added

- Include SNS nervous system parameters.

### Changed
### Deprecated
### Removed
### Fixed
### Security


## [Proposal 126006](https://nns.ic0.app/proposal/?u=qoctq-giaaa-aaaaa-aaaea-cai&proposal=126006)
### Changed
- Updated the SNS bindings used by the aggregator.

## [Proposal 125319](https://nns.ic0.app/proposal/?u=qoctq-giaaa-aaaaa-aaaea-cai&proposal=125319)
### Changed
* Updated libraries provided by the `ic` repository to `release-2023-06-07_23-01`.

## [Proposal 124788](https://nns.ic0.app/proposal/?u=qoctq-giaaa-aaaaa-aaaea-cai&proposal=124788)

### Wasm changes

* In fast updates, update `derived_state` and `lifecycle` as well as the now deprecated `swap_state`.
* New field `logo` in the `meta` data with the relative path to the logo asset.
* Add a getting started section in landing page.
* Various minor style improvements: favicon, spacing, status "open" color and text clamp

## [Proposal 124250](https://nns.ic0.app/proposal/?u=qoctq-giaaa-aaaaa-aaaea-cai&proposal=124250)

### Added
* More tests that the SNS aggregator contains the expected number of SNSs.
* Display commit, branch name and similar data when deploying to a test canister.
### Changed
- Ensure that the last paginated entry is incomplete.
### Fixed
* Update the path to the `nns-sns-wasm` .did file.
* Update the index.html when it has changed.

## [Proposal 123719](https://nns.ic0.app/proposal/?u=qoctq-giaaa-aaaaa-aaaea-cai&proposal=123719)

### Added
- Style (UI design) for the landing page
- Add a link that points to NNS Dapp GitHub repo 
- Display swaps' lifecycle on the landing page
### Changed
- Updated `ic-cdk` to the latest version and use the, now separate, `ic-cdk-timers`.
- Updated IC commit to `06f339b83ce37e3fc9571e1b4251fbcf5c1a8239`, made on Mon July 3 2023.
- Shortened patch files by namespacing Principal automatically, automating the use of EmptyRecord and using CallResult in API declarations.
