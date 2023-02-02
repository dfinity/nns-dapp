import { getSnsTransactions } from "$lib/api/sns-index.api";
import {
  loadIcrcAccountNextTransactions,
  loadIcrcAccountTransactions,
  type LoadIcrcAccountNextTransactions,
  type LoadIcrcAccountTransactionsParams,
} from "$lib/services/icrc-transactions.services";

export const loadSnsAccountTransactions = async (
  params: Omit<LoadIcrcAccountTransactionsParams, "getTransactions">
) =>
  loadIcrcAccountTransactions({
    ...params,
    getTransactions: getSnsTransactions,
  });

export const loadSnsAccountNextTransactions = async (
  params: Omit<LoadIcrcAccountNextTransactions, "loadAccountTransactions">
) =>
  loadIcrcAccountNextTransactions({
    ...params,
    loadAccountTransactions: loadSnsAccountTransactions,
  });
