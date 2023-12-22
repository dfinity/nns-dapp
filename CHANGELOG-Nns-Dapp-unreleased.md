# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

- Disable dissolve delay editing when the maximum is reached.
- Implement `Storable` for accounts.
- `UnboundedStableBTreeMap` as an account storage medium.
- Save accounts in the `pre_upgrade` hook only when accounts are stored in the heap.
- Save account stats in the `pre_upgrade` hook rather than recomputing them in the `post_upgrade` hook.
- Migration functions.
- Render pending and failed BTC withdrawal transaction as such.
- Add `ENABLE_SNS_TYPES_FILTER` feature flag.

#### Changed

- Use `ic_cdk::println` instead of the `dfn_core` equivalent.

#### Deprecated

#### Removed

#### Fixed

- Remaining wrong dissolve delay error message after min/max click.
- Avoid unnecessary calls to SNS root canister ids to get the canister ids.
- Min dissolve delay button updates not only for the first time.
- Fix scrollbar in multiline toast message. 

#### Security

#### Not Published

### Operations

#### Added

Entry for bitcoin canister in `dfx.json`.

#### Changed

- Apply clippy only to target `wasm32-unknown-unknown` but prohibit `std::println` and variants for that target.

#### Deprecated

#### Removed

* Remove `past-changelog-test`.

#### Fixed

#### Security
