# Changelog

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
