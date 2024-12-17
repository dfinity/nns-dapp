import type { Account } from "$lib/types/account";
import type { TransactionWithId } from "@dfinity/ledger-icp";
import type { NeuronInfo } from "@dfinity/nns";

export type ReportingPeriod = "all" | "last-year" | "year-to-date";

export type TransactionsDateRange = {
  /** Start of the date range (inclusive) - timestamp in nanoseconds */
  from?: bigint;
  /** End of the date range (exclusive) - timestamp in nanoseconds */
  to?: bigint;
};

export type TransactionEntity =
  | {
      identifier: string;
      balance: bigint;
      type: "account";
      originalData: Account;
    }
  | {
      identifier: string;
      balance: bigint;
      type: "neuron";
      originalData: NeuronInfo;
    };

export type TransactionResults = {
  entity: TransactionEntity;
  transactions: TransactionWithId[];
  error?: string;
}[];
