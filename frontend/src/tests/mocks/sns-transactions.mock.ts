import type { SnsTransactionsStoreData } from "$lib/stores/sns-transactions.store";
import type { IcrcTransaction, IcrcTransactionWithId } from "@dfinity/ledger";
import { Principal } from "@dfinity/principal";
import type { Subscriber } from "svelte/store";

const fakeAccount = {
  owner: Principal.fromText("aaaaa-aa"),
  subaccount: [] as [],
};

const mockSnsTransaction: IcrcTransaction = {
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
      fee: [BigInt(1)],
    },
  ],
};

export const mockSnsTransactionWithId: IcrcTransactionWithId = {
  id: BigInt(123),
  transaction: mockSnsTransaction,
};

export const mockSnsTransactionsStoreSubscribe =
  (store: SnsTransactionsStoreData) =>
  (run: Subscriber<SnsTransactionsStoreData>): (() => void) => {
    run(store);

    return () => undefined;
  };
