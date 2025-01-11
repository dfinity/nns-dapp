import {
  CKBTC_LEDGER_CANISTER_ID,
  CKTESTBTC_LEDGER_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { loadIcrcToken } from "$lib/services/icrc-accounts.services";
import { ENABLE_CKTESTBTC } from "$lib/stores/feature-flags.store";
import { get } from "svelte/store";

export const loadCkBTCTokens = async () => {
  const enableCkBTCTest = get(ENABLE_CKTESTBTC);
  return Promise.all([
    loadIcrcToken({ ledgerCanisterId: CKBTC_LEDGER_CANISTER_ID }),
    enableCkBTCTest
      ? loadIcrcToken({ ledgerCanisterId: CKTESTBTC_LEDGER_CANISTER_ID })
      : undefined,
  ]);
};
