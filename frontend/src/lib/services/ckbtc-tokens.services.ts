import {
  CKBTC_LEDGER_CANISTER_ID,
  CKTESTBTC_LEDGER_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import {
  ENABLE_CKBTC,
  ENABLE_CKTESTBTC,
} from "$lib/stores/feature-flags.store";
import { get } from "svelte/store";
import { loadIcrcToken } from "./icrc-accounts.services";

export const loadCkBTCTokens = async () => {
  const enableCkBTC = get(ENABLE_CKBTC);
  const enableCkBTCTest = get(ENABLE_CKTESTBTC);
  return Promise.all([
    enableCkBTC
      ? loadIcrcToken({ ledgerCanisterId: CKBTC_LEDGER_CANISTER_ID })
      : undefined,
    enableCkBTCTest
      ? loadIcrcToken({ ledgerCanisterId: CKTESTBTC_LEDGER_CANISTER_ID })
      : undefined,
  ]);
};
