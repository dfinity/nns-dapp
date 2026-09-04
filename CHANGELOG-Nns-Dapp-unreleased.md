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

- The proposal detail page no longer parses the text fields of a payload as
  JSON, so a text that nests JSON thousands of levels deep no longer breaks
  the page.

#### Security

- The "Hide Balance" option now also masks the balances in the accessible names
  on the Portfolio page. Before, the cards kept the exact amounts in their
  `aria-label` attributes, so a screen reader announced them.
- Impose a Candid decoding quota on every exported method that takes an argument. The quota limits the DoS surface from decoding bombs.
- The sign-out message in the URL is now limited to known messages. Before, a
  crafted link could show any text as an official toast.
- Check and escape the canister install arguments that the canister puts in the
  `Content-Security-Policy` of every page. A value that is not a web address
  could previously end the `content` attribute and add live `HTML` to the page.
  The install or the upgrade now fails if a value is not a web address. The
  check also limits the `ROBOTS` argument to the `robots` `meta` tag.

- The import token validation no longer sends the user principal to the entered
  canisters. The ledger and index canister IDs come from the form or from the
  URL, so the two validation calls now use the anonymous identity.
- A proposal summary now renders only the tags and the attributes that markdown
  needs. Before, the summary could add page-wide styles, a form with input
  fields, or the class names of the app, and imitate the wallet UI.
- The image in a proposal payload no longer adds markup of its own to the page.

#### Not Published

### Operations

#### Added

#### Changed

#### Deprecated

#### Removed

#### Fixed

#### Security
