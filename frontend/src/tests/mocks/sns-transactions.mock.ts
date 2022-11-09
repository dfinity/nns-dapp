import type { SnsTransactionsStore } from "$lib/stores/sns-transactions.store";
import { Principal } from "@dfinity/principal";
import type { SnsTransaction, SnsTransactionWithId } from "@dfinity/sns";
import type { Subscriber } from "svelte/store";

const fakeAccount = {
  owner: Principal.fromText("aaaaa-aa"),
  subaccount: [] as [],
};

const mockSnsTransaction: SnsTransaction = {
  kind: "transfer",
  timestamp: BigInt(12354),
  burn: [],
  mint: [],
  transfer: [
    {
      to: fakeAccount,
      from: fakeAccount,
      memo: [],
      created_at_time: [BigInt(123)],
      amount: BigInt(33),
    },
  ],
};

export const mockSnsTransactionWithId: SnsTransactionWithId = {
  id: BigInt(123),
  transaction: mockSnsTransaction,
};

interface SnsCandidAccount {
  owner: Principal;
  subaccount: [] | [Uint8Array];
}

export const createSnstransactionWithId = (
  to: SnsCandidAccount,
  from: SnsCandidAccount
): SnsTransactionWithId => ({
  id: BigInt(123),
  transaction: {
    kind: "transfer",
    timestamp: BigInt(12354),
    burn: [],
    mint: [],
    transfer: [
      {
        to,
        from,
        memo: [],
        created_at_time: [BigInt(123)],
        amount: BigInt(33),
      },
    ],
  },
});

export const mockSnsTransactionsStoreSubscribe =
  (store: SnsTransactionsStore) =>
  (run: Subscriber<SnsTransactionsStore>): (() => void) => {
    run(store);

    return () => undefined;
  };
