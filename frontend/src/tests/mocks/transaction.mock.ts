import type { Transaction as NnsTransaction } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { Transaction, UiTransaction } from "$lib/types/transaction";
import { AccountTransactionType } from "$lib/types/transaction";
import { TokenAmount } from "@dfinity/utils";
import { mockMainAccount, mockSubAccount } from "./icp-accounts.store.mock";
import { mockSnsToken } from "./sns-projects.mock";

export const createMockSendTransaction = ({
  amount = 110000023n,
  fee = 10000n,
  to = mockSubAccount.identifier,
}: {
  amount?: bigint;
  fee?: bigint;
  to?: string;
}): NnsTransaction => ({
  transaction_type: [{ Transfer: null }],
  memo: BigInt(0),
  timestamp: { timestamp_nanos: BigInt("0") },
  block_height: BigInt(208),
  transfer: {
    Send: {
      to,
      fee: { e8s: fee },
      amount: { e8s: amount },
    },
  },
});

export const mockSentToSubAccountTransaction = createMockSendTransaction({
  to: mockSubAccount.identifier,
});

export const createMockReceiveTransaction = ({
  amount = 110000000n,
  fee = 10000n,
  from = mockMainAccount.identifier,
}: {
  amount?: bigint;
  fee?: bigint;
  from?: string;
}): NnsTransaction => ({
  transaction_type: [{ Transfer: null }],
  memo: BigInt(0),
  timestamp: { timestamp_nanos: BigInt("1652121288218078256") },
  block_height: BigInt(208),
  transfer: {
    Receive: {
      fee: { e8s: fee },
      from,
      amount: { e8s: amount },
    },
  },
});

export const mockReceivedFromMainAccountTransaction =
  createMockReceiveTransaction({ from: mockMainAccount.identifier });

const displayAmount = 11000000000000000n;

export const mockTransactionReceiveDataFromMain: Transaction = {
  type: AccountTransactionType.Send,
  isReceive: true,
  isSend: false,
  from: "aaaaa-aa",
  to: "bbbbb-bb",
  displayAmount,
  date: new Date("03-14-2021"),
};

export const mockTransactionSendDataFromMain: Transaction = {
  type: AccountTransactionType.Send,
  isReceive: false,
  isSend: true,
  from: "aaaaa-aa",
  to: "bbbbb-bb",
  displayAmount,
  date: new Date("03-14-2021"),
};

export const createMockUiTransaction = ({
  domKey = "123-1",
  isIncoming = false,
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
  headline,
  otherParty,
  tokenAmount,
  timestamp,
});
