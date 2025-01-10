import type { GetTransactionsResponse } from "$lib/api/icp-index.api";
import type { UiTransaction } from "$lib/types/transaction";
import { mockSubAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import type { TransactionWithId } from "@dfinity/ledger-icp";
import { TokenAmount } from "@dfinity/utils";

export const createMockUiTransaction = ({
  domKey = "123-1",
  isIncoming = false,
  isPending = false,
  headline = "Sent",
  otherParty = "aaaaa-aa",
  tokenAmount = TokenAmount.fromE8s({
    amount: 330_000_000n,
    token: mockSnsToken,
  }),
  timestamp = new Date("2021-08-01T15:00:00.000Z"),
}: Partial<UiTransaction>): UiTransaction => ({
  domKey,
  isIncoming,
  isPending,
  headline,
  otherParty,
  tokenAmount,
  timestamp,
});

export const mockTransactionWithId: TransactionWithId = {
  id: 1234n,
  transaction: {
    memo: 0n,
    icrc1_memo: [],
    operation: {
      Transfer: {
        to: "1234",
        fee: { e8s: 10_000n },
        from: "56789",
        amount: { e8s: 100_000_000n },
        spender: [],
      },
    },
    created_at_time: [],
    timestamp: [],
  },
};

export const createMockSendTransactionWithId = ({
  amount = 110_000_023n,
  fee = 10_000n,
  to = mockSubAccount.identifier,
  memo = 0n,
}: {
  amount?: bigint;
  fee?: bigint;
  to?: string;
  memo?: bigint;
}): TransactionWithId => {
  const transfer = {
    ...mockTransactionWithId.transaction["Transfer"],
    to,
    fee: { e8s: fee },
    amount: { e8s: amount },
  };
  const operation = {
    Transfer: transfer,
  };
  const transaction = {
    ...mockTransactionWithId.transaction,
    operation,
    memo,
  };
  return {
    ...mockTransactionWithId,
    transaction,
  };
};

export const mockEmptyGetTransactionsResponse: GetTransactionsResponse = {
  transactions: [],
  oldestTxId: 0n,
  balance: 0n,
};
