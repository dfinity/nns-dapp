import { getTransactions } from "$lib/api/icp-index.api";
import { DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";
import { icpTransactionsStore } from "$lib/stores/icp-transactions.store";
import { toastsError } from "$lib/stores/toasts.store";
import { toToastError } from "$lib/utils/error.utils";
import { sortTransactionsById } from "$lib/utils/icp-transactions.utils";
import { nonNullish } from "@dfinity/utils";
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
    const maxResults = DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT;
    const identity = await getCurrentIdentity();
    const { transactions, oldestTxId } = await getTransactions({
      accountIdentifier,
      identity,
      maxResults: BigInt(maxResults),
      start,
    });

    // If API returns less than the maxResults, we reached the end of the list.
    const completed = transactions.some(({ id }) => id === oldestTxId);
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

  const sortedTransactions = nonNullish(store[accountIdentifier])
    ? sortTransactionsById(store[accountIdentifier].transactions).reverse()
    : [];
  const lastTxIdStore = sortedTransactions[0]?.id;
  return loadIcpAccountTransactions({
    accountIdentifier,
    start: lastTxIdStore,
  });
};
