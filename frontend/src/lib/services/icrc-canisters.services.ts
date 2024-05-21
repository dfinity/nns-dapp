import {
  CKETHSEPOLIA_INDEX_CANISTER_ID,
  CKETHSEPOLIA_LEDGER_CANISTER_ID,
  CKETH_INDEX_CANISTER_ID,
  CKETH_LEDGER_CANISTER_ID,
} from "$lib/constants/cketh-canister-ids.constants";
import {
  CKUSDC_INDEX_CANISTER_ID,
  CKUSDC_LEDGER_CANISTER_ID,
} from "$lib/constants/ckusdc-canister-ids.constants";
import {
  ENABLE_CKTESTBTC,
  ENABLE_CKUSDC,
} from "$lib/stores/feature-flags.store";
import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
import { isNullish } from "@dfinity/utils";
import { get } from "svelte/store";

export const loadIcrcCanisters = async () => {
  const storeData = get(icrcCanistersStore);
  // To avoid rerendering the UI and possibly triggering new requests
  // We don't change the store if it's already filled.
  if (isNullish(storeData[CKETH_LEDGER_CANISTER_ID.toText()])) {
    icrcCanistersStore.setCanisters({
      ledgerCanisterId: CKETH_LEDGER_CANISTER_ID,
      indexCanisterId: CKETH_INDEX_CANISTER_ID,
    });
  }
  if (
    get(ENABLE_CKTESTBTC) &&
    isNullish(storeData[CKETHSEPOLIA_LEDGER_CANISTER_ID.toText()])
  ) {
    icrcCanistersStore.setCanisters({
      ledgerCanisterId: CKETHSEPOLIA_LEDGER_CANISTER_ID,
      indexCanisterId: CKETHSEPOLIA_INDEX_CANISTER_ID,
    });
  }
  if (
    get(ENABLE_CKUSDC) &&
    isNullish(storeData[CKUSDC_LEDGER_CANISTER_ID.toText()])
  ) {
    icrcCanistersStore.setCanisters({
      ledgerCanisterId: CKUSDC_LEDGER_CANISTER_ID,
      indexCanisterId: CKUSDC_INDEX_CANISTER_ID,
    });
  }
};
