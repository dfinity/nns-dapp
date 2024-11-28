import { getTransactions } from "$lib/api/icp-index.api";
import { DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";
import { icpTransactionsStore } from "$lib/stores/icp-transactions.store";
import { toastsError } from "$lib/stores/toasts.store";
import { toToastError } from "$lib/utils/error.utils";
import { sortTransactionsByIdDescendingOrder } from "$lib/utils/icp-transactions.utils";
import { isNullish, nonNullish } from "@dfinity/utils";
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
    const identity = getCurrentIdentity();
    const { transactions, oldestTxId } = await getTransactions({
      accountIdentifier,
      identity,
      maxResults: BigInt(maxResults),
      start,
    });

    const completed =
      isNullish(oldestTxId) || transactions.some(({ id }) => id === oldestTxId);

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

  const sortedTransactionsDescendingOrder = nonNullish(store[accountIdentifier])
    ? sortTransactionsByIdDescendingOrder(store[accountIdentifier].transactions)
    : [];
  const lastTxIdStore = sortedTransactionsDescendingOrder.at(-1)?.id;
  return loadIcpAccountTransactions({
    accountIdentifier,
    start: lastTxIdStore,
  });
};
