# Changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Therefore, each proposal is documented below, following the relevant changes.

## Unreleased

Unreleased changes are added to `CHANGELOG-Nns-Dapp-unreleased.md` and moved
here after a successful release.

## Proposal 130144

### Application

#### Added

* Enabled `ENABLE_CKUSDC` feature flag.

#### Removed

* Message informing about proposal topic changes.

#### Fixed

* Render neurons with minimum dissolve delay correctly with voting power.
* Nns-dapp may crash while finishing an empty receive.
* Actionable proposals initialization before Sns-es were loaded.

### Operations

## Proposal 130081

### Application

#### Added

* Get `ckUSDC` canister IDs from environment/configuration.

#### Changed

* Set `Actionable Proposals` as the default selection.

#### Removed

* Stop writing account transactions to stable memory.

#### Fixed

* Rendering tokens with fewer than 8 decimals.
* Don't allow inputting more decimals than the token supports.

#### Security

* Downgrade to Rust `1.77.2`.

#### Not Published

* Support `ckUSDC` behind a feature flag.

### Operations

#### Added

* Include `ckUSDC` when generating `args.did` and `.env`.
* Include `ckUSDC` canister IDs when importing from URL with `scripts/canister_ids`.

#### Changed

* Keep existing `dfx` identities when running an `snsdemo` snapshot.

## Proposal 129748

### Application

#### Added

* Close modal on ESC key press.
* Add `ENABLE_ACTIONABLE_TAB` feature flag.
* Support `ApiBoundaryNodes` in `FirewallRulesScope` of `AddFirewallRulesPayload`.
* Support `SubnetRental` topic.
* Support NNS function 52 for `SubnetRentalRequest`.

#### Changed

* Update IC, Candid, and `ic-cdk` dependencies.
* Changed support for NNS function 43 from `AddApiBoundaryNodePayload` (singular) to `AddApiBoundaryNodesPayload` (plural).

#### Removed

* Stop encoding the accounts map in the `AccountsStore`.
* Removed `ENABLE_HIDE_ZERO_BALANCE` feature flag.
* Proposal filtering by reward status.
* Intermediate step to remove transactions from accounts stored in nns-dapp.

#### Fixed

* Successful swap message should not be shown when participant count is insufficient.

### Operations

#### Added

* Added workflow to update IC cargo dependencies.

#### Changed

* In `migration-test`, also populate some accounts between upgrade and downgrade.
* Update `dfx` version from 0.15.3 to 0.19.0.

## Proposal 129618

### Application

#### Added

* Add new proposal types support (47-51)
* Message informing about proposal topic changes.
* Tooltips with exact voting power on voted neurons.
* Display the total count of actionable proposals.

#### Changed

* Update IC dependencies in nns-dapp crates.
* Update `ic-stable-structures` dependency to 0.6.4.
* New main menu selection style.
* Rename some topics and proposal types.

#### Removed

* Stop storing transactions in the nns-dapp canister.
* Removed metrics that were derived from transactions stored in the canister.

#### Fixed

* Inconsistency in similar NNS neuron sorting.
* Adjust Metrics block visibility for certain screen widths.

### Operations

#### Added

* Added `upgrade-downgrade-test` script.

#### Changed

* Automatically handle `candid::define_function` in `did2rs`.

#### Fixed

* Make `did2rs` work on Mac.

## Proposal 129435

### Application

#### Added

* Actionable proposal indication.

#### Changed

* Update main navigation style on mobile. 

### Operations

#### Changed

* Disallow build warnings for Rust.

## Proposal 129396

### Application

#### Added

* Order ICP sub-accounts based on balance.

#### Changed

* Reorder launchpad sections.
* Improve launchpad card text alignment.
* Store account data in stable structures instead of on the heap.

#### Removed

* Deprecate the feature flag `ENABLE_ICP_INDEX`.
* Removed `get_transactions` method from nns-dapp canister.

#### Fixed

* SNS selector gaps.

### Operations

#### Added

* Install `pocket-ic` in `scripts/setup`.

## Proposal 129080

### Application

#### Added

* Tooltip with exact voting power in voting card.

#### Changed

* Sort neurons by decreasing dissolve delay when stakes are equal.
* Make the progress bar on the swap page straight instead of rounded.

#### Fixed

* Fixed duplicate tooltip IDs to be unique.
* Redirect to accounts page after signing in on wallet page with incorrect account identifier.
* Make sure `IdentifierHash` uses a unique `id` and `aria-describedby` attribute.
* Place tooltip in document body to avoid overflow issues.
* Align "Nervous System" and universe title on the neurons tab.

### Operations

#### Added

* Added a test that stats are not recomputed on upgrade but rather serialized and de-serialized.

## Proposal 129030

### Application

#### Added

* Setting to hide tokens with zero balance.

#### Changed

* Always omit the account parameter in the URL when navigating to a main account.
* Display the block timestamp instead of created timestamp on ICP transaction.
* Minor style changes for mobile project selector.

#### Removed

* Remove `protobuf` dependency for Ledger hardware wallet.

#### Fixed

* Make token table rows always clickable. A few edge cases were missing.
* Don't require double hardware approval on neuron staking.

### Operations

#### Fixed

* Reinstall xz in reproducible assets workflow to get consistent archives.

## Proposal 128768

### Application

#### Added

* Add feature flag `ENABLE_HIDE_ZERO_BALANCE`.

#### Changed

* Adjusted table colors in dark theme.

#### Fixed

* Min ckBTC withdrawal amount was unknown when withdrawing directly from My Tokens.
* Fix menu width in collapsed state.

### Operations

## Proposal 128350

### Application

#### Changed

* Load ICP transactions from ICP index canister instead of nns-dapp.
* More readable error messages if `assert_eq` fails in tests.
* Order neurons from highest to lowest stake on the neurons page.
* Main navigation text changes.
* Minor text changes.
* Main menu icons and style changes.

### Operations

#### Fixed

* Make `JestPageObjectElement.selectOption` work with fake timers.

## Proposal 128297

### Application

#### Changed

* Refactored `icpAccountsStore` to be derived from separate stores.
* Wording changes for ineligible neurons description.

#### Removed

* Removed unreleased feature flag `ENABLE_ICP_ICRC`.

#### Fixed

* Don't reload transactions multiple times when closing the receive modal.
* Reload balance when opening NNS wallet.

### Operations

#### Added

* Notify the maintainers if the docker build is not reproducible.

#### Changed

* Disambiguated the title of the docker reproducibility check.
* Change the number of accounts tested in `test-upgrade-map-stable` from 1000 to 20.
* Andrew will be making the release forum posts.

#### Fixed

* Adapted the docker reproducibility test to work with `upload-artifact@v4`.

## Proposal 128153

### Application

#### Added

* Add `ENABLE_ICP_INDEX` feature flag.
* Add metrics and logging for schema migration.

#### Changed

* Minor wording and style changes on the neuron detail page.
* Enable loading state from stable structures.
* Enable migrating state to and from stable structures.

#### Deprecated

- Remove support for devices with Internet Computer App version smaller than 2.4.9.

#### Removed

* Remove functionality to add pending swap transactions in NNS Dapp canister.

#### Fixed

* Bug where transferred SNS neurons appeared in the list of neurons after transferring them.
* Bug when the "Manage Internet Identity" link always uses `internetcomputer.org` domain.

### Operations

#### Added

* Dependabot configuration to update GitHub actions.
* Add `NNS_INDEX_CANISTER_ID` to the configuration.

#### Changed

* Upgraded `ic-js` dependencies to utilize `agent-js` patched version `v1.0.1`.
* Avoid a 5 minute timeout in CI by waiting 20 seconds instead.
* Fixed the formatting command in the `update-aggregator-response` GitHub workflow.

#### Fixed

* Adapted Dockerfile to the new `dfx` installation procedure.

## Proposal 127764

### Application

#### Added

* Add `ENABLE_VOTING_INDICATION` feature flag.
* Add "Manage Internet Identity" and "Source code" entries to account menu.
* Client side caching of SNS Aggregator calls.
* Prompt the user to check the hardware wallet screen when splitting a neuron controlled by one.

#### Changed

* Refactor tokens store usage.
* Store SNS accounts in `icrcAccountsStore`.

#### Removed

* Stop loading SNS tokens individually because they are already loaded from the SNS aggregator data.
* Remove `ENABLE_SNS_TYPES_FILTER` feature flag.

### Operations

#### Added

* Test that project logo (not token logo) is displayed on SNS wallet.

#### Changed

* Update the GitHub `build-push-action` from `v4` to `v5`.
* Upgrade Rust to 1.76.0
* Ignore failures of `test-upgrade-map`

#### Removed

* Remove periodic app subnet deployment of nns-dapp.

## Proposal 127696

### Application

#### Added

* Add fee as mandatory when making ICP transactions.
* Add the token symbol in the send modals.
* Add new boundary node proposals support.
* Prevent the `1Password` extension from appearing in input fields.
* Support HTML within toast messages.

#### Changed

* Stable memory is owned by State structure to control access.
* Voting power calculation formatting.
* Voting rewards description.
* Unify implementations of SNS token wallets with other (non-ICP) token wallets.

#### Removed

* Unused `i18n` messages.
* Remove `ENABLE_MY_TOKENS` feature flag.

#### Fixed

* QR-code reader incorrectly mirrored on `Samsung S23`.
* Check SNS neuron balances to claim pending neurons.
* Neurons that can vote being displayed as ineligible on the SNS proposal detail page.

### Operations

#### Added

* Check for unused i18n messages.

## Proposal 127669

### Application

#### Added

* Close button at the bottom of follow neurons modal.
* Info tooltips in neuron details.
* Use logo for token (if present) for `ICRC` (but non-`SNS`) tokens.
* Filtering SNS Proposals by type.
* Add the token symbol in the receive modal.

#### Changed

* Various wording changes.
* Display the full neuron type text within the tag.
* Wording in "no neurons to vote" section.
* Implement `State` traits manually rather than automatically.

#### Removed

* Remove `ENABLE_CKETH` feature flag.
* Remove unused `transactionsFeesStore` and related.

#### Fixed

* Fix proposal back navigation during voting.
* Fix tooltip positioning.
* Tooltip icon style.

### Operations

#### Added

* Add `.orig` file extension to `.gitignore` file.

#### Changed

* Frequency of update workflows moved to weekly instead of daily.
* Update GitHub actions to newer versions.

## Proposal 127458

### Application

#### Added

* New block "Stake a neuron" on proposal details page.
* Getter and setter of partition schema label.

#### Changed

* Changed wording about staking neurons to staking tokens.
* Add missing feature flags to default feature flags value.
* Various wording changes.

#### Removed

* ckBTC withdrawal account.
* Don't show the red error outline on dissolve delay input when the dissolve delay is not enough to have voting power.

#### Fixed

* Fix gaps between sections on the mobile launchpad page.

### Operations

#### Added

* Add `reviewers` to the `update-*.yml` workflows that create PRs.

#### Fixed

* Commented out broken local `config.test`.

## Proposal 127093

### Application

#### Added

* Add "API Boundary Node Management" topic support.
* A work-around to recover unsupported ICRC-1 tokens.
* Copy button to followed neuron IDs.

#### Changed

* New light and dark theme colors.
* Pluralise neurons on proposal detail page.
* Placeholder when the transaction list is empty.
* New QR code icon.
* Render wallet page when not signed in.

#### Removed

* non-ICRC2 BTC withdrawal flow.

#### Fixed

* BTC deposit address QR code spinner in dark theme.
* Missing NF-neurons on SNS proposal detail page.

### Operations

#### Added

- Exercise new migration test.

#### Changed

* Upgrade to `dfx` 0.15.3.

#### Fixed

* Keep local replica accessible locally when specifying --domain to dfx-snapshot-start.

## Proposal 126904

### Application

#### Added

* Redesign proposal detail neurons block (collapsible).
* Display status in "voted neurons" headline.

#### Changed

* Default to main account on wallet page when `account` parameter is missing from the URL.

#### Fixed

* Reverted the upgrade to SvelteKit 2 as it breaks iOS 15.
* Auto updating wallet balances

### Operations

## Proposal 126861

### Application

#### Added

* Disable dissolve delay editing when the maximum is reached.
* Implement `Storable` for accounts.
* `UnboundedStableBTreeMap` as an account storage medium.
* Save accounts in the `pre_upgrade` hook only when accounts are stored in the heap.
* Save account stats in the `pre_upgrade` hook rather than recomputing them in the `post_upgrade` hook.
* Migration functions.
* Render pending and failed BTC withdrawal transaction as such.
* Add `ENABLE_SNS_TYPES_FILTER` feature flag.

#### Changed

* Use `ic_cdk::println` instead of the `dfn_core` equivalent.

#### Fixed

* Remaining wrong dissolve delay error message after min/max click.
* Avoid unnecessary calls to SNS root canister ids to get the canister ids.
* Min dissolve delay button updates not only for the first time.
* Fix scrollbar in multiline toast message. 
* Go back to accounts page for incorrect account identifier in SNS wallet page.
* Stay on the same universe when navigating back from wallet to the accounts page.

### Operations

#### Added

* Entry for bitcoin canister in `dfx.json`.

#### Changed

* Apply clippy only to target `wasm32-unknown-unknown` but prohibit `std::println` and variants for that target.

#### Removed

* Remove `past-changelog-test`.

## Proposal 126734

### Application

#### Added

* Sns dynamic voting proportions.
* Iterator over AccountsDbs.
* Display expiration date for sns proposals.
* Neuron type support.
* Card with BTC deposit address and QR code in ckBTC wallet.
* Merge Approve transfer with BTC "Sent" transaction in transaction list.
* Display Neurons' Fund commitment progress bar.
* `range()` method to `AccountsDbTrait`.
* Render ckBTC Reimbursement transactions.

#### Changed

* Render BTC deposits/withdrawals as "BTC Received"/"BTC Sent".
* Update Rust version: `1.74.0` -> `1.74.1`
* Provide space for migration state in the `ProxyDb`.
* Rename "Launch Pad" to "Launchpad".

#### Fixed

* Limit the size of proposal payload rendering errors, as otherwise the error can become too large to return.
* Provide a fallback if proposal payloads don't have the expected type.
* Temporary work-around for broken SNS.

#### Security

* Bump css-tools dev dependency to fix minor vulnerability.

### Operations

#### Changed

* Allow npm greater than v10 in frontend project.

#### Removed

* Remove `.gitattributes`.

#### Fixed

* Provide missing global config in cache-filling workflow.
* Update the correct flavour of golden file when the NNS Dapp canister API changes.
* Specify the node version to use in the version bump test.
* Summarize the `AccountsStore` contents in its `Debug` representation rather than trying to print its entire contents.
* Lock the spellcheck version and its dependencies.
* Keep `dfx start` logs in CI.
* Let canister IDs provided by the dfx cli override fixed canister IDs in config files.  Needed for local deployments.

## Proposal 126313

### Application

#### Added

* Support for CkETH token.

#### Removed

* Remove logic for using ICRC-1 when staking a neuron.

### Operations

## Proposal 126305

### Application

#### Added

* Enable ICRC-2 flow for BTC withdrawal.
* Add ENABLE_CKETH feature flag.
* Get ckETH canister IDs from environment/configuration.
* Display BTC deposits with 1-11 confirmations as "pending".

#### Removed

* Remove the `ENABLE_FULL_WIDTH_PROPOSAL` feature flag.

#### Fixed

* Fix swallowed undefined fields in raw json view. 

#### Not Published

* Structure to protect Rust access to stable memory.

### Operations

#### Added

* Experimental tests for schema migration.
* Add optional version support to the storage records.
* Include ckETH canister IDs when importing from URL with `scripts/canister_ids`.
* Include ckETH when generating args.did and .env.

#### Changed

* Adapt `release-sop` script to work with DevEnv instead of staging.

## Proposal 126093

### Application

#### Added

* Button to buy ICP with an external provider.

#### Fixed

* Fix docker builds when there is no global config.
* Fix "Expiration date" countdown label visibility.
* Optimize nns proposal rendering for small devices.

### Operations

#### Changed

* Update Rust to the latest stable version (1.74.0).
* Move the commands that derive aggregator code from NNS candid files.
* Better text for rust update PRs.

#### Removed

* References to static testnets.

## Proposal 126004

### Application

#### Added

* Render withdrawal address on ckBTC burn transactions.

#### Changed

* New icons for sent/received transactions.
* Increase the pre-migration account limit.
* Use "From:" instead of "Source:" for received transactions.

#### Fixed

* Add missing "Rename" button in the subaccount page.
* Fix disappearing "Received" half of to-self transactions.
* Fix debug store that wasn't working.
* Fix the stuck loading issue with the Sns proposal.

### Operations

#### Added

* Add a workflow to update the SNS aggregator bindings regularly.
* Added support for global network config.
* Cron job to update proposal types.
* Enable dependabot for Rust updates.
* Workflow to get the latest NNS and SNS canister candid files.
* Try to prevent calls to global.fetch in unit tests.
* Add `devenv_llorenc` and `devenv_dskloet` to list of networks.

#### Changed

* Update `ic-wasm` to the latest version.
* Factor out the `snsdemo` installation.
* Make the location of the snsdemo checkout configurable.
* Add `prod` and `aggregator-prod` to the list of public releases.
* Update `dfx` to `v0.15.1`.
* Update the URL of the app subnet to what dfx v15 expects.
* Use a unique branch when updating the snsdemo release, didc, IC candid files or rust.
* Better checks that the network is defined.

#### Fixed

* Remove accidentally committed (empty) directory and fix commit patterns.
* Fix local deployments with `dfx 0.15.1`.

## Proposal 125580

### Application

#### Added

* Add a link to the ICP Dashboard in the project detail page.
* Add collapse-all functionality to json tree view.

#### Changed

* Read schema version from stable memory.

#### Fixed

* Show canister title in details when user is not the controller.

#### Not Published

* Use ICRC-2 for BTC withdrawal when `ENABLE_CKBTC_ICRC2` is enabled.

### Operations

#### Added

* Cron job to update proposal types.
* Enable dependabot for Rust updates.
* Workflow to get the latest NNS and SNS canister candid files.
* Try to prevent calls to global.fetch in unit tests.

#### Changed

* Update `ic-wasm` to the latest version.
* Factor out the `snsdemo` installation.
* Add `prod` and `aggregator-prod` to the list of public releases.

#### Removed

* No longer update rust bindings when NNS canister interfaces are updated.

## Proposal 125508

### Application

#### Added

* Specified the preferred storage schema as an argument.
* Added provenance information to .did files and derived rust code.
* Add `UpdateElectedHostosVersions` and `UpdateNodesHostosVersion` proposals support.
* Show the maximum participation of the Neurons' Fund when present.
* A list of exceptional (not-rendered, zero value) transactions.

#### Changed

* Stable structures updated to `0.6.0`.
* Dapp upgraded to Svelte `v4`.
* New Proposal Card.
* Change the slider in dissolve delay for a read-only progress bar.
* Redesign the proposal payload and action.
* Switch the flag to use redesigned proposal detail page sections by default.
* Redesign the proposal voting section.
* Beautify the proposal cards look & feel.

#### Removed

* Removed debounce on deriving Network from ckBTC send address.

#### Fixed

* Remove robots meta tag to allow search engines to crawl NNS Dapp.
* Fix i18n key in merge neurons summary screen.
* Display `TransferFrom` as a normal receive instead of failing to load transactions.
* Fix issue with setting max dissolve delay when max is not a whole day.

#### Not Published

* Added `retrieveBtcWithApproval` in ckbtc-minter API.
* Render Approve transactions in transaction list.
* Add feature flag `ENABLE_CKBTC_ICRC2`.

### Operations

#### Added

* Import candid for NNS ledger.
* Formatting for `Cargo.toml` files.
* Add test to check that the nns-dapp cargo and npm versions match.
* Script to deploy nns-dapp on `DevEnv`.

#### Changed

* Install `dfx` by means of the dedicated GitHub action.
* Stop updating candid files when updating the test environment.
* Join npm audit URLs with spaces instead of commas.
* Add traits with a dedicated command rather than with patch files.
* Use snsdemo snapshot with Internet Identity version 2023-10-27.

#### Removed

* Delete nightly `GitHub` job to update II used in tests; we now use the II that comes with `snsdemo`.

## Proposal 125338

### Application

#### Fixed

* Fix issue with transactions not appearing in the Wallet page.

## Proposal 125318

### Application

#### Changed

* Update proposal info icons position to improve the UX.
* Improve the indicator of the minimum commitment in the project status.

#### Fixed

* Add "Finalizing" status in projects of the Launchpad.
* Fix UI bug when commitment was very low.

#### Not Published

* Added `approveTransfer` in icrc-ledger API.
* New feature flag `ENABLE_MY_TOKENS`.
* Detailed values of the Neurons' Fund and direct participation in the project detail page.

### Operations

#### Added

* Documentation for the proposals payload renderer.
* E2E test for ckBTC.
* Fix erroneous failures in the `tip` tagging workflow when a PR is closed without merging.
* Add --host flag to dfx-snapshot-start.

#### Changed

* Migrate the Jest unit test suite to Vitest.

## Proposal 125061

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

#### Fixed

* Separators in project page appearing without data inside.
* Cycles displayed as T Cycles on canister detail page.

### Operations

#### Changed

* Put unreleased changes in `CHANGELOG-Nns-Dapp-unreleased.md` to avoid bad merges.

#### Removed

* Remove npm script `update:next`.

## Proposal 124999

### Application

#### Added

* New feature flag `ENABLE_FULL_WIDTH_PROPOSAL`.

#### Changed

* Make a histogram of transactions per account, used to optimize the new account storage.
* Include a copy of the `nns-governance` candid file in the `nns-dapp` repository.
* Update the IC commit in the `proposals` crate to `release-2023-08-01_23-01`.
* Separate proposals backend into a separate crate.
* Improve spacings in the page headings.
* Improve the skeletons while loading in the neuron details page.
* Review the chunking strategy to enhance the dapp's loading time and prevent random, rare flashes of unstyled content (FOUC).
* New header UI in the canister detail page.
* New labels for min and max participation.

#### Removed

* Remove `ENABLE_DISBURSE_MATURITY` feature flag.
* Remove `ENABLE_SNS_AGGREGATOR_STORE` feature flag.

#### Fixed

* Change inconsistency in the name of an NNS topic.

#### Security

* Rename `memo` on the ICRC-1 interface of the ICP ledger API to `icrc1Memo` and add a warning about the `memo` and `icrc1Memo` being unrelated.

#### Not Published

* New UI to better explain the commitment of Neurons' Fund and direct participation.

### Operations

#### Added

* Run several script tests on macos as well as ubuntu.
* Extend the release SOP script up to submitting the proposal.
* Check spelling in Rust documentation as part of CI.

#### Changed

* Factor out the core of `did2rs` for wider use.
* Reduce the manual changes needed for `did2rs` by automating more.
* Use `clap` argument parsing in `did2rs`.
* Populate the PR description of the `didc` updater.
* Update the `snsdemo` test environment, `dfx` and the IC commit of the NNS canisters.
* Update the snsdemo commit & automate further updates.
* Cron job to update `snsdemo` weekly.
* Update data for the Launchpad Prod test.

#### Removed

* Comment and skip dfx-nns-proposal-args.test.

## Proposal 124855

### Application

#### Added

* Select destination when disbursing maturity.

#### Changed

* Use ICRC-1 transfer on ICP ledger canister instead of generic ICRC-1 ledger canister.
* Allow `get_histogram` (an unstable API) only as a query call.
* Set `ENABLE_SNS_AGGREGATOR_STORE` true for production.
* Use custom button label for disburse maturity flow.

#### Fixed

* Fix CSS on canister cards to show tooltip and name correctly.

#### Not Published

* Use ICRC-1 transfer when staking a neuron, behind a feature flag.

### Operations

#### Changed

* Fix the `release-sop` command that set `origin/main` as the upstream.
* Specify the version of `binstall` in `dfx.json`.
* Fix the proposal matching pattern in `nns-dapp/split-changelog` that used to match aggregator proposals as well.
* Fix the rust-update action.

## Proposal 124787

### Application

#### Added

* Add the amount of maturity related to a selected percentage.
* Disburse maturity of sns neurons.

#### Changed

* Show the token selector also when not signed in.
* Use consistent positioning for the copy icon in the Hash component.
* Allow setting a dissolve delay that's shorter than what's required for voting power.
* Improve contrast of token selector's logo in light theme.
* Remove the "Project" leading word in the SNS Project card.

#### Fixed

* Fixed issues with SetDissolveDelay component.
* Fix sent transaction icon background color dark theme.
* Improve text color of total value locked's label.
* Make duration rendering consistent.
* Improve Tooltip location when container hides part of it.

### Operations

#### Changed

* Specify the `snsdemo` version in `dfx.json`.
* Make the file list stats accessible in logs and as a file in the release artefacts.
* Support using the nns-dapp downgrade-upgrade test with Wasms other than prod.

#### Fixed

* Fix build script by pinning cargo-binstall version.

## Proposal 124486

### Application

#### Added

* Make NNS Dapp accessible via wallet.ic0.app and wallet.internetcomputer.org.

#### Changed

* Add a database abstraction layer, preparing for migration.
* Put common accountsdb tests in a macro and call that rather than copying the list of tests.
* Change accounts storage heap structure from `HashMap` to `BTreeMap`.
* Made disburse neuron flow more consistent with other transaction flows.
* New colors in NNS Dapp.
* Make the format of `get_toy_account()`, used in testing, compatible with `get_account()`.
* Make a histogram of account sizes, used to optimize the new account storage.

#### Removed

* Remove unused components after new neuron details page.

### Operations

#### Added

* Add "Filter proposals by Votable only" e2e test.
* `--import-from-index-html` flag on `scripts/canister_ids` to get canister IDs from an existing (testnet) release.
* A dictionary for spell-checking.
* New "finalizing" status in SNS project detail page.

#### Changed

* Set `ENABLE_SNS_AGGREGATOR_STORE` true in unit tests.

## Proposal 124328

### Application

#### Changed

* Bigger icon and description first on Sns project page.

#### Removed

* Remove ENABLE_NEURON_SETTINGS feature flag.

#### Fixed

* Header in accounts, canisters and neurons was not visible after user came back from logging in.
* Address issue with displayed SNS balances on quickly switching between SNSes.

#### Security

* Update dependency of @adobe/css-tools because of https://github.com/advisories/GHSA-hpx4-r86g-5jrg

#### Not Published

* Disburse maturity of sns neurons.

### Operations

#### Added

- Add a command to increment the package versions.

#### Changed

- Use the upstream notification action directly, rather than using a local copy.
- Support comments in proposal titles.  Example: `Proposal 1111 (cherry-pick)`

## Proposal 124280

### Application

#### Added

* New tag for NNS neurons: "Hardware Wallet".
* New derived state store for SNS projects.
* Identify swap participation ICP transactions.
* Improve error messaging on payload size limit in proposals list page.
* New lifecycle store for SNS projects.
* New feature flag ENABLE_SNS_AGGREGATOR_STORE.
* Introduce an option to collapse or expand the application's menu on large screen.
* Remove some unused fields from the aggregator converted type.
* Display active sns neuron maturity disbursements.

#### Changed

* Access accounts only by getter and setter; do not assume that in-place modifications are possible.
* Defined an account data store interface, to allow account storage migrations.
* Update SNS Swap types to match the latest canister interface. 
* Hide by default the proposal summary in ballots.
* Review checkboxes vertical alignment, border contrast on dark mode and remove hover background colors
* Launchpad proposal requests only Open proposals of the SNS topic.
* When reusing cached agents, use the current identity instead of the one in the cached agent.
* New landing pages for Accounts, Neurons, Canister and Settings when not logged in.
* Remove login page and redirect to accounts instead.

#### Removed

* Remove ENABLE_SIMULATE_MERGE_NEURONS flag.

#### Fixed

* Fix wrong "ICP Staked" message in SNS neurons.

#### Not Published

* Use new stores as source of data instead of snsQueryStore.

### Operations

* Format markdown files, such as `README.md`, except changelogs and frontend markdown files.
* Improve the rust document generation.
* Fix shellcheck issues.

#### Added

* Make it easy to skip the CI build step for quick testing.
* Screenshot e2e tests.
* Allow specifying a test_filter to the e2e CI action.
* New test util to set SNS projects for testing.
* Make scripts/past-changelog-test check again the previous commit when run on main.
* Unit tests for the detailed `min_participant_icp_e8s` rendering.

#### Changed

* Moved e2e-tests/scripts/ to scripts/e2e-tests/ (but deleted update-chromedriver).
* Moved e2e-tests/scripts/ to scripts/e2e-tests/.
* Change some unit tests to set a system time and not rely on actual time.

#### Removed

* Remove compressed `.wasm` files from releases.  Please use `.wasm.gz` instead.
* Remove `frontend/jest-spy.ts`.
* Remove e2e-tests/

#### Fixed

* Avoid SIGPIPE in scripts/past-changelog-test which caused flakiness.

#### Security

* Fixed some tests that depended on execution order.
* [CVE-2023-38497](https://blog.rust-lang.org/2023/08/03/cve-2023-38497.html): Update Rust from version `1.71.0` to `1.71.1`.
## Proposal 124252 (cherry-pick)

### Application

#### Fixed

* Detailed `min_participant_icp_e8s` rendering hack for Modclub SNS.
* Disable HW from participating in swaps.

## Proposal 124014

### Application

#### Changed

* Don't display proposal navigation on launch-pad page.
* Update SNS Aggregator response type and related converters.
* Implement the standard accounts dropdown selector in canisters' features.
* Review and optimize the number of steps and the UI of the canisters' related modals.
* Hotkeys can now manage Neurons' Fund participation as long as the neuron is not controlled by a hardware wallet.
* Hardware Wallet users need to sign transactions only once. Except for staking a neuron.
* New NNS and SNS neuron details page layout.

#### Removed

* Remove fallback to load SNSes directly from SNS canisters.
* Remove ENABLE_SNS_AGGREGATOR flag.
* Remove relying on the swap raw metrics to get the number of buyers of a Swap.

#### Fixed

* Fix missing referrer path on subpages.
* Fix some type discrepancies with SNS aggregator data.
* Do not show unnecessary scrollbar in notifications.
* Fix error when getting an SNS Aggregator page fails.
* Maintain text color in hyperlinks card when hovered.
* Prevent default behavior of copy button to avoid unintentional navigation when used in hyperlinks cards.
* Prevent the submission of cycles for top-up review unless an amount has been entered first.

### Operations

#### Added

* Proposal details e2e test.
* Automatically populate the change log section in the release proposal.
* Remove empty section headings in scripts/nns-dapp/split-changelog.
* Make it easy to skip the CI build step for quick testing

#### Changed

* Update candid interface for NNS governance to improve 1-proposal support.
* Rename deleted workflows to start with "ZZZ".

#### Fixed

* past-changelog-test compares lines numbers correctly.
* Ignore SIGPIPE in scripts/past-changelog-test which caused flakiness.

## Proposal 123921

### Application

#### Added

* Enable merge neurons preview.
* Display page title in browser's tab.

#### Changed

* Refactor storage to prepare for schema migration.
* Enhance user experience by rendering hyperlinks for the cards displayed on the Accounts, Neurons, Proposals, Launchpad, and Canister pages instead of buttons
* Bump agent-js `v0.18.1`.
* Clarify Ledger app version error message.
* Increase the displayed size of the projects logo on the "Launchpad".
* Do not display the "Vote on Proposals" title in the page's header on wide screens to align the behavior with pages that support multiple projects.
* New icon for dissolving neuron state.
* Keep menu open and visible on large screen (not only on extra large screen).
* Use tar format `gnu` instead of `ustar` to archive the frontend assets, to keep reproducibility between GNU tar versions 1.34 and 1.35.

#### Fixed

* Show the current dissolve Delay in the modal to increase a dissolving SNS neuron.
* Avoid repeating queries to canister status if the principal is not a controller, and avoid long-lasting display of skeletons.
* Correctly set the referrer on the detail page to go back to the effective previous page. Useful for the proposal detail page that can be opened from either from the "Proposals" or "Launchpage" pages. 
* Fix incorrect error message when the user tries to set a lower sns dissolve delay than current.

#### Not Published

* New NNS and SNS neuron details page layout.

### Operations

#### Added

* A separate build of nns-dapp for testing.  See: https://github.com/dfinity/nns-dapp/releases/tag/dev-build-test-tag
* A test that state is preserved in downgrade-upgrade tests.
* Support SNS neuron permission in fake SNS governance API.
* Support selective pausing and resuming in API fakes.

#### Changed

* Create the `noassets` build using rust feature flags, for consistency, instead of with a separate build stage.
* Updated the downgrade-upgrade test summary.
* Increased the size of the persistent state in downgrade-upgrade tests.
* Moved the downgrade-upgrade test into a dedicated job.
* Faster formatting of shell and yaml files, by operating only on named or changed files.
* Updated the calls to `docker-build` to use the `--network` flag.
* Upgraded to Playwright 1.36.

#### Fixed

* Deploy.sh script
* Improve sns governance e2e test.

#### Security

## Proposal 123718

### Application

#### Added

* Support for ICP transactions with Icrc addresses as the destination.

#### Changed

* Improve visibility of proposal summary headers.
* Improve copy in button to set or increase dissolve delay of a neuron.

### Operations

#### Added

* Install `ic-wasm` as part of the setup command.
* Better visibility of upgrade cycle consumption, wasm size and memory usage.
* Check that release-sop is the newest version when it's run.
* Compile end-to-end tests to catch type errors.

#### Changed

* Use faster GitHub runners for e2e tests.
* Replace `ic-cdk-optimizer` with `ic-wasm shrink`.
* Migrate some e2e tests from wdio to playwright.

## Proposal 123471
### Application

#### Changed

* Revert display of TVL in various currencies to USD only
* Removed `OWN_CANISTER_URL`.
* Setting Dissolve Delay supports 888 years.
* Improve responsiveness in proposal filter modals.
* Only Locked neurons are mergeable.
* Add copy button to sns proposal proposer id.
* New neuron state icons.

#### Deprecated
#### Removed
#### Fixed

- Destroy sns neuron component and page after disburse.

#### Security

* Changed `OWN_CANISTER_URL` to `'self'` in the CSP.  These are equivalent but `'self'` does not depend on the deployment config.

#### Not Published

### Operations

#### Added

* Nns voting e2e test.
* Added CI workflows to update rust and didc automatically, by cron job or button click.
* Script to reorganize CHANGELOG-Nns-Dapp.md after a release.
* Test that no new change log entries are added to existing releases.
* New feature flag "ENABLE_NEURON_SETTINGS".
* Playwright connects to PLAYWRIGHT_BASE_URL if specified in the environment.
* release-sop.test now has a flag to update golden files.

#### Changed

* Updated `didc` to the latest release.
* Migrated some end-to-end tests from Wdio to Playwright.
* Use the newest snsdemo snapshot with the sns_aggregator preloaded.
* Split Playwright e2e test on CI into 2 shards.

#### Deprecated
#### Removed

* Duplicate `ic-cdk-optimizer` version field.

#### Fixed

#### Security

## Proposal 123423
### Application

#### Added

* Render SNS neuron voting power in neuron detail page.
* Users can now add names to canisters to easily identify them within NNS Dapp only.
* Periodically check for new transactions and updated balances of the ckBTC tokens/accounts.

#### Changed

* Simplify rust cache expiry with `pop_first()`.
* Updated `bitcoin-canister` revision for proposal payload support.
* Improve proposal action rendering.

#### Fixed

* Fix bug with newly created canisters where the name was ovewritten to empty string.

#### Not Published

* Progress on merge neurons preview, behind a flag.

### Operations

#### Added

- CreateServiceNervousSystem proposal support.
- Base64 image support for payload rendering.
- `scripts/canister_ids` can now remove canisters from `canister_ids.json`.
- Added a script to perform part of the release SOP.

#### Changed

- Consolidated the config tests.
- Set a custom URL for `internet_identity` on `ic` rather than using the default.
- Improve Canister Detail tests by mocking the api layer instead of services.
- Copied the newest version of clap.bash from snsdemo.

#### Fixed

* ci-link script uses correct workflow name.

## Proposal 123301

### Application

#### Added

* Periodically check for new transactions and updated balances of the SNS tokens/accounts.
* Decode the payment (amount) from the QR code reader.
* Add "Select All" and "Clear" selection in proposal filters.
* Add vesting information in SNS neuron detail.
* Render SNS neuron voting power in neuron detail page.

#### Changed

* Disable functionality buttons while SNS neuron is vesting.
* Ignore sign-in "error" `UserInterrupt`.

#### Deprecated

* Web Workers have been migrated to ES modules, which means that Firefox users using versions [prior to v114](https://caniuse.com/?search=worker%20module) won't be able to read certain data in the UI, such as TVL and canisters' cycles, unless they upgrade their browser to a more recent release.

#### Fixed

* Title of Ledger device transaction when staking two neurons on a row.
* Enable voting for proposals that are decided but still accepting votes.
* Misplaced tooltip for disabled SNS neuron split button.

### Operations

#### Added

* Added a command line tool to get the arguments of a canister upgrade proposal, for verification purposes.
* Publish the arguments used in every release.
* A script to download the WASM from GitHub CI build.
- A script to get the WASM hash from the GitHub CI build log.
* Instructions to verify canister args in proposal.
* Added a command to inspect canister upgrade proposals. (See: scripts/dfx-nns-proposal-args)
* More test for the release-sop script.

#### Changed

- Refactored CI tests to reduce network load related failures.
- Fix coreutils installation issues on M1 apple laptops.
- Made per-network configuration in dfx.json optional.
- Consolidated the `docker-build` and `aggregator` GitHub workflows into the `build` workflow, to reuse the build artefacts and so reduce network load on the runners.
- Increased timeout on end-to-end tests running on CI.

#### Removed

* Deleted the now empty `docker-build` and `aggregator` GitHub workflows.

## Proposal 123245

* Render the SNS Neuron age.
* Fix navigation issue from SNS proposal to the Launchpad.
* Use the count of participants from the derived state instead of using the
* SNS governance raw metrics.
* TVL in various currencies.

## Proposal 123006

* Improvement in NNS proposal filters.
* New field minimum participants in project detail page.
* Mobile experience improvements.
* Use minter info to retrieve ckBTC parameters (retrieve min amount, kit fee and number of confirmations).
* Fix for Dragginz SNS metrics.

## Proposal 122791

* Improve Apple install to home screen look and feel.
* Enable sns-voting.
* Add a call to "update_balance" for ckBTC during the withdrawal account check process.
* Improve participation UI.
* Fix UI warning duplicate form field id in the same form.
* Minor fixes.

## Proposal 122747

* Improve ICRC accounts loading performance.
* Improve loading state UX.
* Update (fav)icons.
* Upgrade libraries.
* Minor fixes and text changes.

## Proposal 122614

* Swap conditions.
* Parameters loading optimisation.
* Libraries loading optimisation.
* Minor bugfixes and improvements.

## Proposal 122512

* Feat reload account and transactions regardless of ckBTC update balance success or error.

## Proposal 122509

* Fix ckBTC transfer status visibility.
* Improve ckBTC transactions reload.

## Proposal 122355

* Improve participation UX.
* Simplifications to reduce stress on the system during upcoming SNS swaps.
* Fix metrics API.
* Fix number formatting on max button click.
* Minor fixes and UI improvements.

## Proposal 122282

* UI improvements.
* Minor bugfixes.

## Proposal 122267

* Receive BTC.
* Convert ckBTC to BTC.
* Minor bugfixes.

## Proposal 122210

* Performance optimization (accounts).
* Minor fixes and UI improvements.

## Proposal 121690

* Add BitcoinSetConfig proposal payload support.
* Minor fixes and UI improvements.

## Proposal 120468
* UI fixes.
* Testing improvements.
* Minor configuration clean up.
* Fix bug when filtering proposals.
* Upgrade dependencies to IC to prepare for new NNS Proposal Action.
* Improve modal width.
* Some copy changes.

## Proposal 119296
* Display info text for Last Distribution.
* Add new field to NNS payload to show arguments as hex string.
* Accessibility improvement: colors and proposal payload/summary contrast.
* Performance improvements (neuron caching).
* Redesign and review of transaction confirmation step.
* Narrowed modal design.
* Modal wizard animation.
* Make followees modal UI more compact.
* Minor style fixes.
* Fix settings title glitch.
* Label updates.
* Minor fixes.

## Proposal 115271
* Fix back to detail from "Settings" page.
* UX improvements:
  * Transaction edit submit form with "Enter".
  * Back button from SNS Proposal Detail page keeps universe.
* Minor bugfixes.

## Proposal 114127
* Select send and receive address by scanning a QR code.
* "Receive" action added to main screen and "Add account" action moved as a card.
* New settings page which displays user principal and session duration
* New proposal payload.
* New data in the project detail.
* Better validations in address inputs.
* Remove unnecessary calls when updating accounts after an action.

## Proposal 112386
* Remove button to increase stake for CF SNS neurons.
* Improve validations in address inputs.

## Proposal 111715
* Upgrade agent-js.
* Bugfixes and minor improvements.

## Proposal 111317
* Stake maturity for SNS neurons.
* Reenable update calls.
* Optimize project calls.
* Minor text updates and fixes.
* Fix bug after voting.
* Upgrade Sveltekit.
* Clean up unused state.

## Proposal 110588
* "high-load" warning fix.

## Proposal 110166
* SNS participation progress screen.
* SNS aggregator improvements.
* Network "high load" notification.
* Polling and request optimization.
* Minor UI and text updates

## Proposal 110166
* Enable SNS aggregator.
* Switch to TVL canister.
* Sale process improvement.
* Minor fixes and improvements.

## Proposal 109947
* Performance improvements by delaying requests when needed.
* Setup caching layer for neurons.
* Payment flow upgrade.
* SNS Aggregator improvements.
* Derived state api.
* Fixes and UI improvements.

## Proposal 108160
* Migration to nns.internetcomputer.org

## Proposal 106377
* Launch ckBTC wallet functionality!
* Fix bug in transactions list.
* Introduce GZIP encoding for assets.
* Fetch data with "query" for not logged in users.

## Proposal 105498
* Remove dashboard routing fallback.
* Login screen minor changes.
* Extended dissolve delay input.
* Payload rendering fix.
* Text and style updates.

## Proposal 104642
* Fix bug encoding and decoding ICRC-1 subaccounts.

## Proposal 104287
* Auto-stake for non-controlled neurons.
* Enable Merge HW controlled neurons.
* Add "created at" parameter in transactions.
* Poll and display canister status (cycles, memory and status).
* Use new library "dfinity/ledger".
* Update proposal rendering (new types).
* Minor fixes and improvements.

## Proposal 103049
* Split layout and new token selector for "Accounts" and "Neurons".
* Display TVL (total value locked) in USD.
* Remove badge "new" next to menu entry "Launchpad".
* Fixes and UI improvements.

## Proposal 101945
* Increase sns neuron stake.
* Split sns neuron.
* Permission update for sns hotkeys.
* UX changes:
  * Theme switcher on login screen.
  * Improve proposal payment and summary rendering.
* Bugfixes.

## Proposal 99659
* Fix disburse button in SNS neurons
* Fix rounding error in sns transactions

## Proposal 98559
* Gzip wasm for proposal payload
* Staking sns neuron.
* Main “Login” page.
* Update main menu entries.
* Dependencies upgrade.
* Minor bugfixes and UI improvements.

## Proposal 98082
* Enable stake maturity for HW.
* Hide vote pane from detail page if proposal reward status has settled.
* Update tcycles fee description.
* Keep track of http agent (optimisation).
* Label updates and bugfixes.

## Proposal 95968
* fix sns minimum dissolve delay description calculation
* fix sns hotkeys permissions
* minor styling and label update

## Proposal 95714
* Followees and dissolve delay in SNS neurons.
* Improvements in rendering proposal payload.
* Unspecific topic in sns.
* Documentation update.
* Tag releases in GitHub automatically.
* Bugfixes.

## Proposal 94588
* UI Improvements in Wallet page.
* UI Improvements in Neuron detail page.
* UI Improvements in Canister detail page.
* Show "undefined" properties in proposal payload.
* Parse bytes from candid payloads and show them as hash.
* UI improvements when showing the payload as JSON.
* Change order of NNS topics when adding new followees.
* Change in some colors.
* Improved title in wallet and sns neuron detail page.
* Fix calculation with voting power in dissolbe delay modal.
* Use absolute path in meta image tag.
* Fix issue with rounding of the amount in transactions.

## Proposal 93596
* Remove redirection in Launchpad page.

## Proposal 93588
* Enable Launchpad and SNS Sale pages.
* Fix bug in voting power calculation.
* UI improvements.

## Proposal 93416
* Fix bug on proposals public page.
* Improvements in wording.
* Improve error message on canister detail page.
* UI improvements in neuron detail page.

## Proposal 93366
* UI redistribution in Neuron details.
* New cards for neurons and accounts.
* Proposals list and proposal details are now public.
* UI improvements on automatic logout.

## Proposal 92180
* New design colors, spacing and layout
* Link to sub-pages on main login screen
* UI/UX fixes
* Stake SNS neuron functionality
* Improve Participate Button

## Proposal 90917
* New routing.
* New login.
* New public page for each tab.
* UI improvements.
* Fonts and font size update.
* Fix bug in topics filter.

## Proposal 89325
* Text improvements in Maturity card.
* Two new NNS Proposal topics.
* Two new nnsFunctions.
* Fix backwards compatibility of the CSP policy for older Android devices.

## Proposal 87079
* Support for new payload type.
* Support for new proposal topic.
* UI Improvements in Stake Maturity.
* Reduce bundle by removing imported test script.

## Proposal 86114
* Enable Stake Maturity for II neurons.
* Fix CSP 'strict-dynamic' issue on Firefox.

## Proposal 86090
* UI fixes for Modal in small devices.
* Fix Buffer polyfill race condition.

## Proposal 86037
* SvelteKit implementation (without routing changes).
* New Modal UI.
* Bump agent-js to v0.14.0
* New flow to top up neurons.
* Fix overflow in proposal details.

## Proposal 84936
* New login page.
* Minor UI improvements.
* Clean unused code.

## Proposal 84287
* Upgrade nns-js, sns-js and utils-js.
* Refactor to support multiple tokens in Accounts.
* Extract CMC functionality to its own library cmc-js.
* Add new proposal types.
* UI fixes on iPad.
* Add sitemap and robots.txt.

## Proposal 81792
* New Voting screens:
  * refreshed design (new cards, new buttons’ color, etc.)
  * information structure modified to present firstly “system information”
  * better use of the space for a quicker and better overview
  * ability to navigate from previous or to next proposal
  * quicker access to voting actions notably on mobile devices thanks to a sticky bottom sheet
* CSP fallback for old devices
* New transaction flow.

## Proposal 80618
* Fix android issues with modal.
* Add pending transaction state in canister.
* Persist proposal filters in local storage
* Upgrade agent-js v0.13.x (uses indexeddb instead of localstorage)
* Upgrade nns-js
* Improve CSP rules and script loader
* Infinite scrolling observer modified to handle list of cards
* Governance labels and descriptions reviewed
* Console output moves to debug information

## Proposal 77051
* Fix android issues with modal.
* Add pending transaction state in canister.

## Proposal 76202
* sanitize proposal title and account identifier for placeholders

## Proposal 75912
* Optimistic voting update
* Toast redesign
* Update nns-js, sns-js, agent-js (0.12.2) and integrate utils-js
* bump IC to the latest version
* extract some ui components and integrate gix-components
* replace .ttf with .woff2 fonts
* add org package.json "name" field
* various improvements in build scripts
* light cleanup of README.md

## Proposal 72733
* Update on maturity text info.
* Upgrade sns-js

## Proposal 72588
* Maturity is displayed without %.
* Fix a bug when adding cycles to a canister.
* Fix a bug in the transaction list.
* Various improvements in the deployment pipeline.
* Changes in font colors.
* Disable agent-js idle observer

## Proposal 71474
* Fix: Update the proposal schema to match the governance canister

## Proposal 71197
* Maturity modulation when spawning a new neuron.
* UI improvements in the modals.
* Add new SNS Proposal topic.
* Make voting for proposals available till duration expires
* Scope proposal detail data load to improve UX navigation between proposals

## Proposal 70821
* e2e tests: Update the way SNS is deployed to the current standard, which is via the wasm canister.
* Update dfx to version 0.11.0-beta.1
* User can leave community fund.
* New Input element.
* New Checkbox element.
* Split "Create or Link Canister" in two buttons.
* Improved error messages when working with hardware wallet.

## Proposal 67969
* Polyfill CSS to support older browsers
* Buttons realignment in Neuron Detail Page
* UI improvements

## Proposal 67799
* Add light theme
* Review dark theme
* Enable theming
* Upgrade agent-js
* Improve signout flow
* Improvements in error management
* No tooltip when not needed. It had problems with Android devices
* Lazy load routes to improve performance

## Proposal 66831
* Update canister payment flow
* New Navigation menu
* Improvements getting the Proposal payload
* Other UI improvements
* Removal of now unused flutter code

## Proposal 65319
* New Canisters Tab built on Svelte
* Fix minor UI issues in the Neurons tab for smaller devices
* Add tooltip to Wallet page to display all ICP
* Fix voting power amount in the Proposal page

## Proposal 63234
* Provide more detailed values for neuron ICP
* Improve support for earlier versions of iPhone

## Proposal 63105
* Truncate ICP per request

## Proposal 62937
* Fix styling of modals on Safari

## Proposal 62896
* Display the svelte version of the accounts and neurons tabs.
* Move the hardware wallet CLI out into a separate repository.
* Improvements to the UI.
* More tests

## Proposal 61859
* Do not offer merging hardware wallet controlled neurons in the UI, as it is currently not supported.
* Add the ability to dump debug info.
* Prepare for more tabs to be released as svelte.
* Improve the infrastructure for third party contributions.
* More tests.

## Proposal 60694
- Update mechanics for creating canisters
- Prepare to release the neuron and accounts tabs in svelte

## Proposal 59149
* Remove slider option for spawning maturity on wallets that don't support it.
* Confirmation screen in Merge Maturity

## Proposal 58993
* Render 32 byte hashes in proposals as strings rather than byte arrays
* New JSON payload renderer
* Refactor the configuration to suport more testing scenarios
* Prepare to render the Neurons tab using svelte
* Fix CSP domains

## Proposal 58151
- Usability and accessibility improvements
  - Add a question that reminds title and topic of the proposal before vote on related detail page
  - Add titles to my votes icons (a11y improvement)
  - Display topic and proposal ID to the proposal detail page
  - Update colours
  - Better loading skeletons
  - Add button titles
- Prevent duplicate hardware wallets from being attached to an account
- Preparations for svelte neurons tab
- Test with NNS canisters running in dfx

## Proposal 56265
* UI fixes:
  * Show the ID of followed neurons again
  * Proposal filtering
* UI improvements
* More tests

## Proposal 55738
* Fix rendering of large payloads.
* Fix double-voting error message.
* Rate limit API calls to reduce the risk of errors for users with large numbers of neurons.
* Add log messages to help diagnose issues experienced by users.
* Update dfx to 0.9.2
* A filter that excludes all proposals was previously ignored, whereas now such a filter will show no results.
* Preparation for switching more of the UI to svelte.
* UI improvements.
* More tests.

## Proposal 54295
- Display the proposals tab using svelte

## Proposal 53536
- Merge neuron functionality (using quill, not the GUI).
- Updated logo
- UI improvements
- More tests

## Proposal 47824
* Update changelog for the last release
* Remove upgrade code needed for the last release only
* Show new `node_provider_id` field in `UpdateNodeOperatorConfigPayload` proposals.
* Svelte UI development
* Fix tests
* Update js library dependencies

## Proposal 47476
* Update dependencies and Rust version.
* Enable merge maturity for hardware wallets.
* End to end test for login.
* Update icon when installed as an Android app.
* More svelte front end changes.

## Proposal 45369
* Upgrade agent-js to 0.10.3 (to resolve some issues with proposal rendering)
* Add "Powered by IC" badge to the login page
* Update the "Follow all" description as now this setting causes the neuron to follow for all proposals except governance proposals
* More Svelte changes (WIP)

## Proposal 44009
* Added entries to the whitelist of proposal types where the payload is small and useful enough to display.
* Small improvements to the UI.

## Proposal 43521
* Proposal types RemoveNodeOperatorsPayload and RerouteCanisterRangePayload are now displayed in the UI.
* Proposal type UpdateNodeOperatorConfigPayload has additional fields: `rewardable_nodes` and `dc_id`
* Small improvements to the UI.
* Resolved reproducibility issue.

## Proposal 42027
* Add custom followees
* Update styling
* Add principal to hardware wallet accounts page
* Security and technical improvements

## Proposal 39269

* Downgrade agent-js back to 0.9.1, as it was breaking hardware wallets
* UI enhancements

## Proposal 39120

* Add a console command to assist with account access
* Replace the svelte routing logic
* Serve the login page as svelte

## Proposal 36273

* Update the flutter login page graphics.
* Fix docker build scripts.
* Update the svelte login page but do not switch it live.

## Proposal 32611

* Fixed an issue where a user's expired session can lead to triggering code related to hardware wallets, even if the user has no hardware wallet accounts.
* Fixed an issue where the "Session expired" dialog didn't redirect to the login page after the user clicked "Ok".
* Removed displaying the user's principal from the Neurons page.

## Proposal 31664

* Switch mainnet to using the HTML renderer for all browsers, rather than only for mobile browsers. This has shown to resolve flickering and rendering issues observed by Monterey and iPads running iOS15. The previous upgrade only switched the renderer in the testnet setup and not production.

## Proposal 31606

*  Switch testnet to using the HTML renderer for all browsers, rather than only for mobile browsers. This has shown to resolve flickering and rendering issues observed by Monterey and iPads running iOS15.

## Proposal 30605

* Adds a 'Split Neuron' button which allows users to split a neuron into 2.
* Adds proposal definitions for 3 new NNS functions allowing their payloads to be randered properly.
* Updates the UpdateSubnetPayload definition to include a few new fields.
* Fix bug where pop-up would not automatically close after adding a hardware wallet.
* Allow payload text to be selected.

## Proposal 27241

* Display the payloads of 'Execute NNS Function' proposals
* Allow markdown in proposal summaries
* Display the new 'title' field on proposals
* Add a `metrics` endpoint for creating dashboards on Prometheus.
* Fetch accounts, balances, and neurons more securely. Rather than fetching sensitive data (e.g. ledger balances) as query calls, we now fetch the data twice in parallel: once as a query call for UI snappiness, and another as an update call to get a certified response. The certified response overwrites the result of the query.
* Ledger wallet: Allow disbursing neurons to a different account.
* Minor UI enhancements.
