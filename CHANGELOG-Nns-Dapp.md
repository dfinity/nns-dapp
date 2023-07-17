# Changelog NNS Dapp

All notable changes to the NNS Dapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The NNS Dapp is released through proposals in the Network Nervous System. Therefore, each proposal is documented below, following the relevant changes.

## Unreleased
### Application

#### Added

* Nns voting e2e test.

#### Changed

* Revert display of TVL in various currencies to USD only
* Removed `OWN_CANISTER_URL`.
* Setting Dissolve Delay supports 888 years.
* Improve reponsiveness in proposal filter modals.
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

* Better visibility of upgrade cycle consumption, wasm size and memory usage.
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
* Users can now add names to canisters to easily identify them within NNS dapp only.
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
