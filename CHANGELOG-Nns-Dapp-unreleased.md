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

* Render BTC deposits/withdrawals as "BTC Received"/"BTC Sent".
* Update Rust version: `1.74.0` -> `1.74.1`
* Provide space for migration state in the `ProxyDb`.
* Rename "Launch Pad" to "Launchpad".
* Use `ic_cdk::println` instead of the `dfn_core` equivalent.

#### Deprecated

#### Removed

#### Fixed

#### Security

#### Not Published

### Operations

#### Added

#### Changed

* Allow npm greater than v10 in frontend project.
* Apply clippy only to target `wasm32-unknown-unknown` but prohibit `std::println` and variants for that target.

#### Deprecated

#### Removed

#### Fixed

#### Security
