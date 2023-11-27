import {
  CKETHSEPOLIA_INDEX_CANISTER_ID,
  CKETHSEPOLIA_LEDGER_CANISTER_ID,
  CKETH_INDEX_CANISTER_ID,
  CKETH_LEDGER_CANISTER_ID,
} from "$lib/constants/cketh-canister-ids.constants";
import {
  ENABLE_CKETH,
  ENABLE_CKTESTBTC,
} from "$lib/stores/feature-flags.store";
import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
import { get } from "svelte/store";

export const loadCkETHCanisters = async () => {
  if (get(ENABLE_CKETH)) {
    icrcCanistersStore.setCanisters({
      ledgerCanisterId: CKETH_LEDGER_CANISTER_ID,
      indexCanisterId: CKETH_INDEX_CANISTER_ID,
    });
  }
  if (get(ENABLE_CKTESTBTC)) {
    icrcCanistersStore.setCanisters({
      ledgerCanisterId: CKETHSEPOLIA_LEDGER_CANISTER_ID,
      indexCanisterId: CKETHSEPOLIA_INDEX_CANISTER_ID,
    });
  }
};
