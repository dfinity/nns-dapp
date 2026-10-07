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

#### Deprecated

#### Removed

#### Fixed

#### Security

- The "Hide Balance" option now also masks the balances in the accessible names
  on the Portfolio page. Before, the cards kept the exact amounts in their
  `aria-label` attributes, so a screen reader announced them.
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
