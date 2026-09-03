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

- Check and escape the canister install arguments that the canister puts in the
  `Content-Security-Policy` of every page. A value that is not a web address
  could previously end the `content` attribute and add live `HTML` to the page.
  The install or the upgrade now fails if a value is not a web address. The
  check also limits the `ROBOTS` argument to the `robots` `meta` tag.

#### Not Published

### Operations

#### Added

#### Changed

#### Deprecated

#### Removed

#### Fixed

#### Security
