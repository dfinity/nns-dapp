# Upgrade frontend NNS Dapp canister to commit `e0e859686e63aae2c3b74a91ccefa2b28022f2f9`
Wasm sha256 hash: `7eb5d026086f22eae02ed3354f871aef97394c141ea82db833496f52a69fdc46` (`https://github.com/dfinity/nns-dapp/actions/runs/2501980127`)

## Change Log:
* New Canisters Tab built on Svelte.
* Fix minor UI issues in the Neurons tab for smaller devices.
* Add tooltip to Wallet page to display all ICP.
* Fix voting power amount in the Proposal page.

## Commit log:

```
+ bash -xc "git log --format='%C(auto) %h %s' 80f9b7ab..e0e85968"
 e0e85968 L2-692: Detach canister remove extra notificatoins (#988)
 9e2237b7 style: align no canisters left (#993)
 472b6e9e style: adjust button line-height to support 2 lines of text in big bu… (#991)
 8c4a3334 fix: tooltip breaking list of cards width (#992)
 8f174fdf style: redo overflow-x on headless layout (#989)
 e9013a73 Move the canisters tab to svelte (#987)
 aee53572 feat: display account icp detailed value in a tooltip (#981)
 6d32c206 L2-685: Voting Power from proposal's ballot (#980)
 327a68a3 chore: update readme formatting (table fix) (#970)
 cfcba0b5 Fix: Round to 8 decimals when Selecting Cycles (#985)
 41b76880 feat: theming support (#982)
 44354bc0 docs: fix JSDoc '@param' tag has name 'settings', but there is no parameter with that name (#979)
 30b8ae15 L2 659 split neuron button placement (#976)
 4cd9fb48 L2-679: Improve merge maturity error with HW (#983)
 1456c6de refactor: canister-details folder name (#977)
 3ec143af fix: 'await' has no effect on the type of this expression (#978)
 9bbe1c6b Start enabling FireFox e2e tests (#973)
 74d2440d prevent overflow x on section (#908)
 d089a775 L2-615: Manage Canister Errors (#975)
 e5dcb70f L2-601: Change X for IconClose (#974)
 15b17a7e CHANGELOG for release on 2022-06-03 (#955)
 cb9bac20 Feat: Claim Seed Neurons (#967)
 86784795 L2 626 extend debug store (#951)
 4092a826 L2-601: Remove Canister Controller (#968)
 bdfad65f L2-644: Improve validation creating canisters (#972)
 2cd55515 Enable FireFox in e2e tests (#964)
 6bb17376 bump nns-js (#963)
 64e28469 Chore: Update Svelte Readme (#971)
 a52d8d86 L2-676: Simplify icp to tcycles conversion (#969)
 3de3c3bc L2-600: Add Controller Part 2 (#960)
 330dc30c fix: various i18n typo (#966)
 f2670906 feat: canister "Copy" action and other card display improvements (#962)
 55028d73 style: align inputs (#965)
 f0ec9c42 L2-618: Message when user not canister controller (#946)
 962d380f refactor: get account from store path store (#959)
 ef76edc6 style: proposal vote long question display (#956)
 5b9c6ab7 feat: improve canister details page routing and data handling (#957)
 83ff3b31 L2-600: Add canister controller Part 1 (#958)
 82546660 feat: translate nns-dapp errors and display max length in account error msg (#922)
 d1b4931c L2-665: Improve getting neuron identity (#945)
 07d74244 build: redo nns-js nightly dependency (#954)
```

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the nns-dapp repo:

git pull  # to ensure you have the latest changes.
git checkout `e0e859686e63aae2c3b74a91ccefa2b28022f2f9`
./scripts/docker-build
sha256sum nns-dapp.wasm
