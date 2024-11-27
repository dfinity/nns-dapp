import { getTransactions } from "$lib/api/icp-index.api";
import { getCurrentIdentity } from "$lib/services/auth.services";
import type { Account } from "$lib/types/account";

export const getTransactionsInPeriodForAllAccounts = async ({
  accounts,
}: {
  accounts: Account[];
}) => {
  try {
    const transactions = await Promise.allSettled(
      accounts.map((account) => {
        const accountId = account.identifier;
        return getTransactionsInPeriod({ accountId });
      })
    );
    console.log(transactions);
    return transactions;
  } catch (error) {
    console.error("Error loading ICP account transactions:", error);
  }
};

const getTransactionsInPeriod = async ({
  accountId,
}: {
  accountId: string;
}) => {
  try {
    const maxResults = 5n;
    const identity = await getCurrentIdentity();
    if (!identity) {
      return;
    }
    const { transactions, oldestTxId } = await getTransactions({
      accountIdentifier: accountId,
      identity,
      maxResults,
      // start,
    });
    console.log(transactions);
    console.log(oldestTxId);
    const completed = transactions.some(({id}) => id === oldestTxId);
    if (!completed) {
      // do recurssion part
      console.log("Transactions not completed");
    }
    return transactions;
    // Handle the completed status appropriately
  } catch (error) {
    console.error("Error loading ICP account transactions:", error);
  }
};
