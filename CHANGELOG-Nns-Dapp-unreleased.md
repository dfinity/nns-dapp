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

* Fetch TVL from NNS dapp canister instead of TVL canister.
* `10%` rollout of re-enabling of certification of certain calls.

#### Deprecated

#### Removed

#### Fixed

* Bug where neurons are displayed as eligible to vote, even though they have already voted.
* Issue with setting exact dissolve delay on SNS neurons.
* Error on canister page for canisters that are not controlled by the user.
* Don't hide neurons which have only staked maturity.
* Not showing the "no proposals" message when not signed in.
* Race condition in proposal loading.

#### Security

#### Not Published

### Operations

#### Added

#### Changed

#### Deprecated

#### Removed

#### Fixed

#### Security
