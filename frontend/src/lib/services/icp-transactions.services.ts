import { getTransactions } from "$lib/api/icp-index.api";
import { DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";
import { icpTransactionsStore } from "$lib/stores/icp-transactions.store";
import { toastsError } from "$lib/stores/toasts.store";
import { toToastError } from "$lib/utils/error.utils";
import { get } from "svelte/store";
import { getCurrentIdentity } from "./auth.services";

export interface LoadIcrcAccountTransactionsParams {
  accountIdentifier: string;
  start?: bigint;
}

export const loadIcpAccountTransactions = async ({
  accountIdentifier,
  start,
}: LoadIcrcAccountTransactionsParams) => {
  try {
    const maxResults = DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT;
    const identity = await getCurrentIdentity();
    const { transactions, oldestTxId } = await getTransactions({
      accountIdentifier,
      identity,
      maxResults: BigInt(maxResults),
      start,
    });
    // If API returns less than the maxResults, we reached the end of the list.
    const completed = transactions.length < maxResults;
    icpTransactionsStore.addTransactions({
      accountIdentifier,
      transactions,
      completed,
      oldestTxId,
    });
  } catch (err) {
    toastsError(
      toToastError({ fallbackErrorLabelKey: "error.fetch_transactions", err })
    );
  }
};

export const loadIcpAccountNextTransactions = async (
  accountIdentifier: string
) => {
  const store = get(icpTransactionsStore);
  return loadIcpAccountTransactions({
    accountIdentifier,
    start: store[accountIdentifier]?.oldestTxId,
  });
};
