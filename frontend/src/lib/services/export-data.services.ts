import { getTransactions } from "$lib/api/icp-index.api";
import { getCurrentIdentity } from "$lib/services/auth.services";
import type { Account } from "$lib/types/account";
import { SignIdentity } from "@dfinity/agent";
import type { TransactionWithId } from "@dfinity/ledger-icp";
import { isNullish } from "@dfinity/utils";

type Response = Array<{
  account: Pick<Account, "identifier" | "balanceUlps" | "name">;
  transactions: TransactionWithId[];
  error?: string;
}>;

export const getTransactionsFromAccounts = async ({
  accounts,
}: {
  accounts: Account[];
}): Promise<Response | undefined> => {
  console.time("getTransactionsFromAccounts");
  const identity = getCurrentIdentity();
  if (!(identity instanceof SignIdentity)) return;

  const accountPromises = accounts.map((account) =>
    getAllTransactionsFromAccountAndIdentity({
      accountId: account.identifier,
      identity,
    })
  );

  const results = await Promise.allSettled(accountPromises);

  const accountsAndTransactions = results.map((result, index) => {
    const account = accounts[index];
    const baseAccountInfo = {
      account: {
        identifier: account.identifier,
        balanceUlps: account.balanceUlps,
        name: account.name,
      },
    };

    if (result.status === "fulfilled") {
      return {
        ...baseAccountInfo,
        transactions: result.value ?? [],
      };
    } else {
      console.error(
        `Failed to fetch transactions for account ${account.identifier}:`,
        result.reason
      );

      return {
        ...baseAccountInfo,
        transactions: [],
        error: result.reason?.message || "Failed to fetch transactions",
      };
    }
  });

  console.log(accountsAndTransactions);
  console.timeEnd("getTransactionsFromAccounts");
  return accountsAndTransactions;
};

export const getAllTransactionsFromAccountAndIdentity = async ({
  accountId,
  identity,
  start = undefined,
  allTransactions = [],
  currentIteration = 1,
  maxIterations = 10,
}: {
  accountId: string;
  identity: SignIdentity;
  start?: bigint;
  allTransactions?: TransactionWithId[];
  maxIterations?: number;
  currentIteration?: number;
}): Promise<TransactionWithId[] | undefined> => {
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
      return getAllTransactionsFromAccountAndIdentity({
        accountId,
        identity,
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
