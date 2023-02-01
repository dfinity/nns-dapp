import type { IcrcTransactionsStoreData } from "$lib/stores/icrc-transactions.store";
import type { IcrcTransaction, IcrcTransactionWithId } from "@dfinity/ledger";
import { Principal } from "@dfinity/principal";
import type { Subscriber } from "svelte/store";

export interface IcrcCandidAccount {
  owner: Principal;
  subaccount: [] | [Uint8Array];
}

export const createIcrcTransactionWithId = (
  to: IcrcCandidAccount,
  from: IcrcCandidAccount
): IcrcTransactionWithId => ({
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
        fee: [BigInt(1)],
      },
    ],
  },
});

const fakeAccount = {
  owner: Principal.fromText("aaaaa-aa"),
  subaccount: [] as [],
};

const mockIcrcTransaction: IcrcTransaction = {
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

export const mockIcrcTransactionWithId: IcrcTransactionWithId = {
  id: BigInt(123),
  transaction: mockIcrcTransaction,
};

export const mockIcrcTransactionsStoreSubscribe =
  (store: IcrcTransactionsStoreData) =>
  (run: Subscriber<IcrcTransactionsStoreData>): (() => void) => {
    run(store);

    return () => undefined;
  };
