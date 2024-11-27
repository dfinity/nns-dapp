import { getTransactions } from "$lib/api/icp-index.api";
import { getCurrentIdentity } from "$lib/services/auth.services";
import type { Account } from "$lib/types/account";
import type { TransactionWithId } from "@dfinity/ledger-icp";
import { isNullish } from "@dfinity/utils";

export const getTransactionsInPeriodForAllAccounts = async ({
  accounts,
}: {
  accounts: Account[];
}) => {
  console.time("getTransactionsInPeriodForAllAccounts");
  const accountPromises = accounts.map((account) =>
    getAllTransactions({
      accountId: account.identifier,
    }).then((transactions) => ({
      account: {
        identifier: account.identifier,
        balanceUlps: account.balanceUlps,
        name: account.name,
      },
      transactions,
    }))
  );

  const results = await Promise.allSettled(accountPromises);

  const accountsAndTransactions = results.map((result, index) => {
    if (result.status === "fulfilled") return result.value;
    else {
      // Handle rejected promise
      console.error(
        `Error loading transactions for account ${accounts[index].identifier}:`,
        result.reason
      );
      return {
        account: {
          identifier: accounts[index].identifier,
          balanceUlps: accounts[index].balanceUlps,
          name: accounts[index].name,
        },
        // should I differentiate between error and empty transactions?
        transactions: [],
      };
    }
  });

  console.log(accountsAndTransactions);
  console.timeEnd("getTransactionsInPeriodForAllAccounts");
  return accountsAndTransactions;
};

const getAllTransactions = async ({
  accountId,
  start = undefined, // Add start parameter with default value
  allTransactions = [], // Add accumulator for all transactions
}: {
  accountId: string;
  start?: bigint;
  allTransactions?: TransactionWithId[];
}): Promise<TransactionWithId[] | undefined> => {
  try {
    const maxResults = 100n;
    const identity = getCurrentIdentity();
    if (!identity) return;

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
      });
    }

    return updatedTransactions;
  } catch (error) {
    console.error("Error loading ICP account transactions:", error);
    return allTransactions; // Return accumulated transactions even if there's an error
  }
};
