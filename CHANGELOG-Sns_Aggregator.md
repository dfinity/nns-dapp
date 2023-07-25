# Changelog SNS Aggregator

All notable changes to the SNS Aggregator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The SNS Aggregator is released through proposals in the Network Nervous System. Therefore, each proposal is documented below, following the relevant changes.

## Unreleased

### Added

- Display commit, branch name and similar data when deploying to a test canister.

### Changed

### Fixed

- Update the index.html when it has changed.

### Security

### Not Published

### Removed

### Deprecated

## [Proposal 123719](https://nns.ic0.app/proposal/?u=qoctq-giaaa-aaaaa-aaaea-cai&proposal=123719)

### Added

- Style (UI design) for the landing page
- Add a link that points to NNS dapp GitHub repo
- Display swaps' lifecycle on the landing page

### Changed

- Updated `ic-cdk` to the latest version and use the, now separate, `ic-cdk-timers`.
- Updated IC commit to `06f339b83ce37e3fc9571e1b4251fbcf5c1a8239`, made on Mon July 3 2023.
- Shortened patch files by namespacing Principal automatically, automating the use of EmptyRecord and using CallResult in API declarations.
