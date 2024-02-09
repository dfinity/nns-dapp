import { getSnsTransactions } from "$lib/api/sns-index.api";
import {
  loadIcrcAccountTransactions,
  type LoadIcrcAccountTransactionsParams,
} from "$lib/services/icrc-transactions.services";

export const loadSnsAccountTransactions = async (
  params: Omit<LoadIcrcAccountTransactionsParams, "getTransactions">
) =>
  loadIcrcAccountTransactions({
    ...params,
    getTransactions: getSnsTransactions,
  });
