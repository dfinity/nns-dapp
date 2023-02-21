import { getCkBTCTransactions } from "$lib/api/ckbtc-index.api";
import {
  loadIcrcAccountNextTransactions,
  loadIcrcAccountTransactions,
  type LoadIcrcAccountNextTransactions,
  type LoadIcrcAccountTransactionsParams,
} from "$lib/services/icrc-transactions.services";

export const loadCkBTCAccountTransactions = async (
  params: Pick<
    LoadIcrcAccountTransactionsParams,
    "account" | "start" | "canisterId"
  >
) =>
  loadIcrcAccountTransactions({
    ...params,
    getTransactions: getCkBTCTransactions,
  });

export const loadCkBTCAccountNextTransactions = async (
  params: Pick<LoadIcrcAccountNextTransactions, "account" | "canisterId">
) =>
  loadIcrcAccountNextTransactions({
    ...params,
    loadAccountTransactions: loadCkBTCAccountTransactions,
  });
