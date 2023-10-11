# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

* Get BTC button to use the mock bitcoin canister to test ckBTC.

#### Changed

* Update the schemas for the governance, registry and SNS Wasm canisters, used for proposal rendering.
* Get the governance, registry and SNS Wasm schemas direcly from `.did` files rather than importing the canisters.
* Improve security by escaping additional images in the proposal summary markdown.
* Internal change: remove unused snsQueryStore.
* New Tag style. Used in followees topic and project status.
* New header UI in the wallet pages.
* Integrated library `marked` within dependencies instead of shipping it as a static asset.

#### Deprecated
#### Removed

#### Fixed

* Separators in project page appearing without data inside.
* Cycles displayed as T Cycles on canister detail page.

#### Security

#### Not Published

### Operations

#### Added

#### Changed

* Put unreleased changes in `CHANGELOG-Nns-Dapp-unreleased.md` to avoid bad merges.

#### Deprecated
#### Removed

* Remove npm script `update:next`.

#### Fixed

#### Security
