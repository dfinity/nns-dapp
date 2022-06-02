import type { Transaction } from "../../lib/canisters/nns-dapp/nns-dapp.types";
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
} as Transaction;

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
} as Transaction;
