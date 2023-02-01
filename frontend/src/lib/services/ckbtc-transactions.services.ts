import { getCkBTCTransactions } from "$lib/api/ckbtc-index.api";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import {
  loadIcrcAccountNextTransactions,
  loadIcrcAccountTransactions,
  type LoadIcrcAccountNextTransactions,
  type LoadIcrcAccountTransactionsParams,
} from "$lib/services/icrc-transactions.services";

export const loadCkBTCAccountTransactions = async (
  params: Pick<LoadIcrcAccountTransactionsParams, "account" | "start">
) =>
  loadIcrcAccountTransactions({
    canisterId: CKBTC_UNIVERSE_CANISTER_ID,
    ...params,
    getTransactions: getCkBTCTransactions,
  });

export const loadCkBTCAccountNextTransactions = async (
  params: Pick<LoadIcrcAccountNextTransactions, "account">
) =>
  loadIcrcAccountNextTransactions({
    canisterId: CKBTC_UNIVERSE_CANISTER_ID,
    ...params,
    loadAccountTransactions: loadCkBTCAccountTransactions,
  });
