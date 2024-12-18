import { NANO_SECONDS_IN_MILLISECOND } from "$lib/constants/constants";
import type {
  Operation,
  Transaction,
  TransactionWithId,
} from "@dfinity/ledger-icp";
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
  timestamp: [{ timestamp_nanos: 235n }],
};

export const dateToNanoSeconds = (date: Date): bigint => {
  return BigInt(date.getTime()) * BigInt(NANO_SECONDS_IN_MILLISECOND);
};

const defaultTimestamp = new Date("2023-01-01T00:00:00.000Z");
export const createTransactionWithId = ({
  memo,
  operation = mockTransactionTransfer.operation,
  timestamp = defaultTimestamp,
  id = 1234n,
}: {
  operation?: Operation;
  memo?: bigint;
  timestamp?: Date;
  id?: bigint;
}): TransactionWithId => {
  const timestampNanos = {
    timestamp_nanos: dateToNanoSeconds(timestamp),
  };
  return {
    id,
    transaction: {
      memo: memo ?? 0n,
      icrc1_memo: [],
      operation,
      created_at_time: [timestampNanos],
      timestamp: [timestampNanos],
    },
  };
};

export const mockTransactionWithId: TransactionWithId = {
  id: 234n,
  transaction: mockTransactionTransfer,
};
