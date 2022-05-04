# Upgrade frontend NNS Dapp canister to commit `236f2fdb984c40b7db2afa27f6404438e9130b3a`
Wasm sha256 hash: `544228a3113e895a2f4386cc0efc0dbfe86b4e7bae6d3f138e871ec36429510e` (`https://github.com/dfinity/nns-dapp/actions/runs/2262896887`)

## Change Log:

- Usability and accessibility improvements
  - Display topic and proposal ID to the proposal detail page
  - Update colours
  - Better loading skeletons
  - Add button titles
- Prevent duplicate hardware wallets from being attached to an account
- Preparations for svelte neurons tab
- Test with NNS canisters running in dfx

## Commit log:

```
+ bash -xc "git log --format='%C(auto) %h %s' 589f27bb..236f2fdb"
 236f2fdb Add support for darwin (#780)
 36664af6 Prevent duplicate hardware wallets from being attached to an account (#678)
 447e7236 chore: declare title for eslint checker (#781)
 66c5816e L2 468 add titles to my votes icons ux improvement (#759)
 6dd7e704 L2-489: Change Success Notification Neuron Actions (#778)
 2b602ac9 feat: &ndash; for question separator (#779)
 60a4dc87 L2-493: Improve skeleton loades in Accounts and Proposals (#776)
 13114b44 feat: display title in proposal question (#777)
 3b924014 Nns canisters locally (#771)
 bbc5f1a7 L2-476 and L2-470: Improve Form Input Validation Error when adding a Hotkey (#769)
 a2c23ac5 feat: revert list proposals to 100 (#775)
 1f1485c6 feat: display question "accept reject proposal" (#774)
 dc15e33f Feat/proposal fetching strategy improvement (#717)
 77fcc925 Changelog for release on 2022-04-22 (#738)
 8b591992 feat: display topic on proposal card (#773)
 adc4d25b feat: increase the number of paginated proposals to 500 (#772)
 d61f321b updated topic color (#770)
 715cf731 L2-484: Improve Merge neurons UX (#768)
 0a97ede3 L2-411: SkeletonCard when loading cards (#766)
 2f40911f L2-474: Follow neuron validations (#765)
 cf751523 L2-340: Remove cancel button set dissolve delay (#764)
 0fa7c280 L2-477 and L2-480: Hotkey manages followees not ManageNeuron (#763)
 f6f22dff L2-372: Merge Maturity (#762)
 7ec73132 feat: toast display as success instead of info + auto hide (#749)
 f8808dc9 feat: code-splitting (#761)
 0df8fef7 Feat/replace sanitizing (#760)
 bcb4ef54 L2-358: Neuron Hotkey Card UI and remove function (#756)
 ffb67942 feat: init add hardware wallet wizard (#758)
 84acabff L2-362: Increase Neuron Stake (#755)
 d0c5febd L2 466 show followee name in neuron detail (#754)
 e1726c87 Fix/filter out manage neuron topic (#753)
 a73754b5 L2-432: Neuron disburse functionality (#739)
 cf3dc4ea refactor: remove duplicate code for destination address (#752)
 601261fc Spawn neuron (#734)
 f35cc91b chore: remove redundant returns (#751)
 82872a1b feat: close accounts action modal on error too (#750)
 a2f9a793 feat: add "new transaction" feature to wallet page (#744)
 4b45987b fix: 'await' has no effect on the type of this expression (#746)
 2cb34bb4 chore: missing types for log function (#748)
 a5571faa docs: fix jsdoc params definition (#747)
 7770059b refactor: rename path id functions (#745)
 62d89ac7 feat: autocomplete to off as default value for input type text (#743)
 be063cb7 feat: disable confirm button while processing (#742)
 fffad702 L2-357: Add hotkey functionality (#733)
```

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the nns-dapp repo:

git pull  # to ensure you have the latest changes.
git checkout `236f2fdb984c40b7db2afa27f6404438e9130b3a`
./scripts/docker-build
sha256sum nns-dapp.wasm
