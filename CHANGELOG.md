# Changelog

## Proposal XXX
... to fill with details from the proposal

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
