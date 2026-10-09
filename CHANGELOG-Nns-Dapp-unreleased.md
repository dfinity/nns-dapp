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
- Impose a Candid decoding quota on every exported method that takes an argument. The quota limits the DoS surface from decoding bombs.
- The sign-out message in the URL is now limited to known messages. Before, a
  crafted link could show any text as an official toast.
- Use the most liquid ICPSwap pool that has a price for a token, so a new pool
  with one tiny trade cannot change the USD values shown.

#### Not Published

### Operations

#### Added

#### Changed

#### Deprecated

#### Removed

#### Fixed

#### Security
