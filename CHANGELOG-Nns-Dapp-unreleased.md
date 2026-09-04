# Unreleased changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Once a
proposal is successful, the changes it released will be moved from this file to
`CHANGELOG_Nns-Dapp.md`.

## Unreleased

### Application

#### Added

- A search button in the header opens the quick search panel. Before, only the
  Ctrl+K (Cmd+K) shortcut opened it, so a touch screen could not reach it.

#### Changed

- Increase the maximum canister name length from 24 to 64 characters.
- Show the canisters on the Canisters page in a table instead of a card grid.

#### Deprecated

#### Removed

#### Fixed

- The quick search panel now fits a phone screen, and its selected row, icon
  tiles and result boxes now have a visible background color.
- On a narrow screen the header buttons no longer shrink while the app loads
  data.

#### Security

- A proposal summary now renders only the tags and the attributes that markdown
  needs. Before, the summary could add page-wide styles, a form with input
  fields, or the class names of the app, and imitate the wallet UI.
- The image in a proposal payload no longer adds markup of its own to the page.
- The topic description and the proposal type description of an SNS now render
  only safe tags.

#### Not Published

### Operations

#### Added

#### Changed

#### Deprecated

#### Removed

#### Fixed

#### Security
