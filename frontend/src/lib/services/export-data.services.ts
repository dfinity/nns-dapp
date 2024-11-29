import { getTransactions } from "$lib/api/icp-index.api";
import { type SignIdentity } from "@dfinity/agent";
import type { TransactionWithId } from "@dfinity/ledger-icp";
import { isNullish } from "@dfinity/utils";

export const getAllTransactionsFromAccountAndIdentity = async ({
  accountId,
  identity,
  lastTransactionId = undefined,
  allTransactions = [],
  currentPageIndex = 1,
}: {
  accountId: string;
  identity: SignIdentity;
  lastTransactionId?: bigint;
  allTransactions?: TransactionWithId[];
  currentPageIndex?: number;
}): Promise<TransactionWithId[] | undefined> => {
  const pageSize = 100n;
  const maxNumberOfPages = 10;

  try {
    // TODO: Decide what to do if we reach the maximum number of iterations.
    if (currentPageIndex > maxNumberOfPages) {
      console.warn(
        `Reached maximum limit of iterations(${maxNumberOfPages}). Stopping.`
      );
      return allTransactions;
    }

    const { transactions, oldestTxId } = await getTransactions({
      accountIdentifier: accountId,
      identity,
      maxResults: pageSize,
      start: lastTransactionId,
    });

    const updatedTransactions = [...allTransactions, ...transactions];

    // We consider it complete if we find the oldestTxId in the list of transactions or if oldestTxId is null.
    // The latter condition is necessary if the list of transactions is empty, which would otherwise return false.
    const completed =
      isNullish(oldestTxId) || transactions.some(({ id }) => id === oldestTxId);

    if (!completed) {
      const lastTx = transactions[transactions.length - 1];
      return getAllTransactionsFromAccountAndIdentity({
        accountId,
        identity,
        lastTransactionId: lastTx.id,
        allTransactions: updatedTransactions,
        currentPageIndex: currentPageIndex + 1,
      });
    }

    return updatedTransactions;
  } catch (error) {
    console.error("Error loading ICP account transactions:", error);
    return allTransactions;
  }
};
