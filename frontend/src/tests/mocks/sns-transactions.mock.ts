import { Principal } from "@dfinity/principal";
import type { SnsTransaction, SnsTransactionWithId } from "@dfinity/sns";

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
