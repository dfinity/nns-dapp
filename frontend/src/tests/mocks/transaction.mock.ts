import type { Transaction as NnsTransaction } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { Transaction } from "$lib/types/transaction";
import { AccountTransactionType } from "$lib/types/transaction";
import { mockMainAccount, mockSubAccount } from "./accounts.store.mock";

export const mockSentToSubAccountTransaction = {
  transaction_type: [{ Transfer: null }],
  memo: BigInt(0),
  timestamp: { timestamp_nanos: BigInt("0") },
  block_height: BigInt(208),
  transfer: {
    Send: {
      to: mockSubAccount.identifier,
      fee: { e8s: BigInt(10000) },
      amount: { e8s: BigInt(110000023) },
    },
  },
} as NnsTransaction;

export const mockReceivedFromMainAccountTransaction = {
  transaction_type: [{ Transfer: null }],
  memo: BigInt(0),
  timestamp: { timestamp_nanos: BigInt("1652121288218078256") },
  block_height: BigInt(208),
  transfer: {
    Receive: {
      fee: { e8s: BigInt(10000) },
      from: mockMainAccount.identifier,
      amount: { e8s: BigInt(110000000) },
    },
  },
} as NnsTransaction;

export const mockTransactionReceiveDataFromMain: Transaction = {
  type: AccountTransactionType.Send,
  isReceive: true,
  isSend: false,
  from: "aaaaa-aa",
  to: "bbbbb-bb",
  displayAmount: 110000000n / 100_000_000n,
  date: new Date("03-14-2021"),
};

export const mockTransactionSendDataFromMain: Transaction = {
  type: AccountTransactionType.Send,
  isReceive: false,
  isSend: true,
  from: "aaaaa-aa",
  to: "bbbbb-bb",
  displayAmount: 110000000n / 100_000_000n,
  date: new Date("03-14-2021"),
};
