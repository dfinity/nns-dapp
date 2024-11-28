import { getTransactions } from "$lib/api/icp-index.api";
import { getCurrentIdentity } from "$lib/services/auth.services";
import { AnonymousIdentity } from "@dfinity/agent";
import type { TransactionWithId } from "@dfinity/ledger-icp";
import { isNullish } from "@dfinity/utils";

export const getAllTransactions = async ({
  accountId,
  start = undefined,
  allTransactions = [],
  currentIteration = 1,
  maxIterations = 10,
}: {
  accountId: string;
  start?: bigint;
  allTransactions?: TransactionWithId[];
  maxIterations?: number;
  currentIteration?: number;
}): Promise<TransactionWithId[] | undefined> => {
  const identity = getCurrentIdentity();
  if (identity instanceof AnonymousIdentity) return;

  const maxResults = 100n;

  try {
    if (currentIteration > maxIterations) {
      console.warn(
        `Reached maximum limit of iterations(${maxIterations}). Stopping.`
      );
      return allTransactions;
    }

    const { transactions, oldestTxId } = await getTransactions({
      accountIdentifier: accountId,
      identity,
      maxResults,
      start,
    });

    const updatedTransactions = [...allTransactions, ...transactions];
    const completed =
      isNullish(oldestTxId) || transactions.some(({ id }) => id === oldestTxId);
    if (!completed) {
      const lastTx = transactions[transactions.length - 1];
      return getAllTransactions({
        accountId,
        start: lastTx.id,
        allTransactions: updatedTransactions,
        maxIterations,
        currentIteration: currentIteration + 1,
      });
    }

    return updatedTransactions;
  } catch (error) {
    console.error("Error loading ICP account transactions:", error);
    return allTransactions; 
  }
};
