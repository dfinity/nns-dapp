# Upgrade frontend NNS Dapp canister to commit `0c1fd54fa687db2b4f44ff3f2a645d8f21ac7d97`
Wasm sha256 hash: `<WASM_HASH>` (`<LINK_TO_GITHUB_ACTION>`)

## Change Log:

* Fix rendering of large payloads.
* Fix double-voting error message.
* Rate limit API calls to reduce the risk of errors for users with large numbers of neurons.
* Add log messages to help diagnose issues experienced by users.
* Update dfx to 0.9.2
* A filter that excludes all proposals was previously ignored, whereas now such a filter will show no results.
* Preparation for switching more of the UI to svelte.
* UI improvements.
* More tests.

## Commit log:

```
+ bash -xc "git log --format='%C(auto) %h %s' b39dd5a9..0c1fd54f"
 0c1fd54f fix: filters have no effect after back from detail page (#731)
 7a1da7b0 feat: show getProposal error message in toast details (#729)
 811a0cb7 Show followee name in neuron details (#727)
 75469429 feat: ignore error "Neuron already voted on proposal." (#726)
 09cb2426 refactor: move principal stringifying to nns-dapp (#724)
 b1193e0b feat: "Loading your neurons..." spinner (#722)
 a837d452 fix: proposal filters counter (#723)
 93166d16 Feat/request and response logs (#721)
 771c87cd feat: chunks get balance calls to ledger (#718)
 1fe8114b feat: init neurons store for voting only once if needed (#719)
 aa5e9fa2 Create a single source of truth (#712)
 e9dd304d feat: redesign toasts (#714)
 bd77a6cc Feat/proposals qu error handling (#713)
 f85332d6 feat: visually center route spinner (#707)
 7e2cfd5a e2e tests: Save html on error (#679)
 5bbf7181 refactor: notVotedNeurons -> votableNeurons (#711)
 1c565577 Feat: Neuron Detail Manage Errors (#705)
 0a7dff42 feat: display fee only on amount step (#710)
 1c69a7f5 Feat: Merge neurons UI (#700)
 5b268f93 feat: new transaction filter selectable accounts (#708)
 bc00b27a style: sort stake neuron information (#709)
 8fd818a6 feat: execute transaction from/to main- and subaccounts (#706)
 6a428499 feat: add more content to dummy proposal (#703)
 6eed914e fix: broken layout of proposal detail long title (#704)
 066c04ed L2 354 following neuron card (#690)
 9861dc6c feat: do not provide "Unspecified" as proposal filter option (#702)
 1b1304fc L2 359 neuron voting history card UI (#668)
 66a0837a fix: reset proposals filter on back from detail page (#698)
 97889550 fix: hidden/cut-off tooltip on mobile (#694)
 94e56ec8 fix: remove from selection neurons w/o votingPower (#695)
 c7f59428 fix: broken summary layout (too wide <pre>) (#701)
 ee681ffb Feat: Neuron detail split (#677)
 8ece1eaa Chore: Update Svelte Readme (#699)
 ffcf225c Update dfx to 0.9.2 (#675)
 f4c1ce43 fix: neuron utils wildcard import (#687)
 3b8657fd Release 2022-04-11: Svelte proposals (#688)
 bf21c101 refactor: style padding calc (#686)
 e11e3277 feat: re-filter proposals returned by governance canister (#697)
 f23482ee fix: max new transaction value (#693)
 7a5d77ef Selectors used by e2e tests (#680)
 82489d73 fix: too long text in the modal title (#691)
 bc6367aa Fix: Small Button with Spinner Issue (#689)
```

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the nns-dapp repo:

git pull  # to ensure you have the latest changes.
git checkout `0c1fd54fa687db2b4f44ff3f2a645d8f21ac7d97`
./scripts/docker-build
sha256sum nns-dapp.wasm
