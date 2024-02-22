import type { Transaction, TransactionWithId } from "@dfinity/ledger-icp";
import { mockMainAccount, mockSubAccount } from "./icp-accounts.store.mock";

export const mockTransactionTransfer: Transaction = {
  memo: 0n,
  icrc1_memo: [],
  operation: {
    Transfer: {
      to: mockSubAccount.identifier,
      fee: { e8s: 10_000n },
      from: mockMainAccount.identifier,
      amount: { e8s: 100_000_000n },
      spender: [],
    },
  },
  created_at_time: [{ timestamp_nanos: 234n }],
};

export const mockTransactionWithId: TransactionWithId = {
  id: 234n,
  transaction: mockTransactionTransfer,
};
