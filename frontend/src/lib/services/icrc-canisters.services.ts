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
import { defaultIcrcCanistersStore } from "$lib/stores/default-icrc-canisters.store";
import { ENABLE_CKTESTBTC } from "$lib/stores/feature-flags.store";
import { isNullish } from "@dfinity/utils";
import { get } from "svelte/store";

export const loadIcrcCanisters = async () => {
  const storeData = get(defaultIcrcCanistersStore);
  // To avoid rerendering the UI and possibly triggering new requests
  // We don't change the store if it's already filled.
  if (isNullish(storeData[CKETH_LEDGER_CANISTER_ID.toText()])) {
    defaultIcrcCanistersStore.setCanisters({
      ledgerCanisterId: CKETH_LEDGER_CANISTER_ID,
      indexCanisterId: CKETH_INDEX_CANISTER_ID,
    });
  }
  if (
    get(ENABLE_CKTESTBTC) &&
    isNullish(storeData[CKETHSEPOLIA_LEDGER_CANISTER_ID.toText()])
  ) {
    defaultIcrcCanistersStore.setCanisters({
      ledgerCanisterId: CKETHSEPOLIA_LEDGER_CANISTER_ID,
      indexCanisterId: CKETHSEPOLIA_INDEX_CANISTER_ID,
    });
  }
  if (isNullish(storeData[CKUSDC_LEDGER_CANISTER_ID.toText()])) {
    defaultIcrcCanistersStore.setCanisters({
      ledgerCanisterId: CKUSDC_LEDGER_CANISTER_ID,
      indexCanisterId: CKUSDC_INDEX_CANISTER_ID,
    });
  }
};
