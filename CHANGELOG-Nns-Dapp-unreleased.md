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

- Increase the maximum canister name length from 24 to 64 characters.

#### Deprecated

#### Removed

#### Fixed

#### Security

- Build the imported-token replacement from certified data when the user imports
  a token, adds an index canister, or removes a token. A save no longer writes
  back a query response, and a save can no longer clear the list because the
  tokens were not loaded.

#### Not Published

### Operations

#### Added

#### Changed

#### Deprecated

#### Removed

#### Fixed

#### Security
