import type { UiTransaction } from "$lib/types/transaction";
import type { TransactionWithId } from "@dfinity/ledger-icp";
import { ICPToken, TokenAmountV2 } from "@dfinity/utils";

export const mapIcpTransactionsToUiTransactions = ({
  transactions,
}: {
  transactions: TransactionWithId[];
}): UiTransaction[] => {
  return transactions.map((transaction) => ({
    // Used in forEach for consistent rendering.
    domKey: transaction.id.toString(),
    isIncoming: false,
    isPending: false,
    isFailed: false,
    isReimbursement: false,
    headline: "test transaction",
    otherParty: undefined,
    tokenAmount: TokenAmountV2.fromUlps({
      amount: 200_000_000n,
      token: ICPToken,
    }),
    timestamp: new Date(),
  }));
};
