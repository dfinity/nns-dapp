import { getTransactions } from "$lib/api/icp-index.api";
import type { Account } from "$lib/types/account";
import { SignIdentity } from "@dfinity/agent";
import type { TransactionWithId } from "@dfinity/ledger-icp";
import { isNullish } from "@dfinity/utils";

export type TransactionsAndAccounts = {
  account: Account;
  transactions: TransactionWithId[];
  error?: string;
}[];

export const getAccountTransactionsConcurrently = async ({
  accounts,
  identity,
}: {
  accounts: Account[];
  identity: SignIdentity;
}): Promise<TransactionsAndAccounts> => {
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
      ...account,
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

  return accountsAndTransactions;
};

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
