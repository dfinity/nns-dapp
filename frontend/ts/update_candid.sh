#!/usr/bin/env bash
didc bind src/canisters/icManagement/canister.did -t ts >./src/canisters/icManagement/rawService.ts
didc bind src/canisters/icManagement/canister.did -t js >./src/canisters/icManagement/canister.did.js
didc bind src/canisters/governance/canister.did -t ts >./src/canisters/governance/rawService.ts
didc bind src/canisters/governance/canister.did -t js >./src/canisters/governance/canister.did.js
didc bind ../../rs/nns-dapp.did -t ts >./src/canisters/nnsDapp/rawService.ts
didc bind ../../rs/nns-dapp.did -t js >./src/canisters/nnsDapp/canister.did.js
