import {
  CKBTC_LEDGER_CANISTER_ID,
  CKTESTBTC_LEDGER_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { loadIcrcToken } from "$lib/services/icrc-accounts.services";
import {
  DISABLE_CKTOKENS,
  ENABLE_CKTESTBTC,
} from "$lib/stores/feature-flags.store";
import { get } from "svelte/store";

export const loadCkBTCTokens = async () => {
  const enableCkBTCTest = get(ENABLE_CKTESTBTC);
  const disableCkTokens = get(DISABLE_CKTOKENS);

  if (disableCkTokens) return undefined;

  return Promise.all([
    loadIcrcToken({ ledgerCanisterId: CKBTC_LEDGER_CANISTER_ID }),
    enableCkBTCTest
      ? loadIcrcToken({ ledgerCanisterId: CKTESTBTC_LEDGER_CANISTER_ID })
      : undefined,
  ]);
};
