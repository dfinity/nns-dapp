# Upgrade frontend NNS Dapp canister to commit `13cfe3ce005a0d39a8e03a815e34e821d6576d67`
Wasm sha256 hash: `d5c209e83736182cde55a4f6b0d0a208a4a99c7b617b1ccdec69b3b80c2c9a44` (`https://github.com/dfinity/nns-dapp/pull/1032/checks`)

## Change Log:
* Update canister payment flow
* UI improvements
* Removal of now unused flutter code

## Commit log:

```
+ bash -xc "git log --format='%C(auto) %h %s' e0e85968..13cfe3ce"
 13cfe3ce Chore: Upgrade nns-js (#1032)
 a05bac75 Handle new flows for creating and topping up canisters (#1000)
 2bc334fd Add `get_proposal_payload` to NNS Dapp canister (#961)
 54a73d08 No flutter (#1023)
 ff74cd4c L2-732: SNS Project Detail Setup (#1021)
 806ffadc Fix: Navigatoin issue on Neuron Detail (#1025)
 98e17aa7 Fix: Opacity of busy screen (#1024)
 707c7302 feat: split pane (#1014)
 bb011859 fix: glitchy ui on signout (#1020)
 de9b755c style: neuron footer tooltip button width (#1019)
 d2679480 Update CODEOWNERS file (#1018)
 843738d4 style: align canister review cycles on small screen (#1016)
 88087dc9 L2-716: Load transaction fee from Ledger Canister (#1005)
 7464dcbc style: footer button width 50% (#1015)
 f85be528 feat: navbar style and stots (#1010)
 19f9d756 Account menu with logout (#1012)
 69d9e2e2 L2-721: i18n Canister api errors (#1008)
 6b898126 L2-728: Refactor Subaccount type transformations (#1009)
 98c8d62d feat: menu (#984)
 82188c55 Chore: Update Readme (#1007)
 1b42b592 docs: fix there is no parameter with that name (#996)
 ffa55e60 Chore: Handle Multiple Request to CMC (#1003)
 753d03d8 L2-715: Ledger use candid (#998)
 b4145d4b Bump ejs (#1001)
 71153d68 Release (#994)
 5521c533 L2-718: Do not check neuron balance always (#999)
 d355ff23 fix: ProposalAction semantic (#997)
 0c43c6bb L2-711: Add claim neurons debug store (#995)
```

## Wasm Verification

To build the wasm module yourself and verify its hash, run the following commands from the root of the nns-dapp repo:

```
git fetch  # to ensure you have the latest changes.
git checkout `13cfe3ce005a0d39a8e03a815e34e821d6576d67`
./scripts/docker-build
sha256sum nns-dapp.wasm
```
