import {
  CKBTC_LEDGER_CANISTER_ID,
  CKTESTBTC_LEDGER_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { loadToken } from "$lib/services/wallet-tokens.services";
import {
  ENABLE_CKBTC,
  ENABLE_CKTESTBTC,
} from "$lib/stores/feature-flags.store";
import { get } from "svelte/store";

export const loadCkBTCTokens = async () => {
  const enableCkBTC = get(ENABLE_CKBTC);
  const enableCkBTCTest = get(ENABLE_CKTESTBTC);
  return Promise.all([
    enableCkBTC
      ? loadToken({ ledgerCanisterId: CKBTC_LEDGER_CANISTER_ID })
      : undefined,
    enableCkBTCTest
      ? loadToken({ ledgerCanisterId: CKTESTBTC_LEDGER_CANISTER_ID })
      : undefined,
  ]);
};
