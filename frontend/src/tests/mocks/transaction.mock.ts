import type { Transaction as NnsTransaction } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { Transaction, UiTransaction } from "$lib/types/transaction";
import { AccountTransactionType } from "$lib/types/transaction";
import { TokenAmount } from "@dfinity/utils";
import { mockMainAccount, mockSubAccount } from "./icp-accounts.store.mock";
import { mockSnsToken } from "./sns-projects.mock";

export const createMockSendTransaction = ({
  amount = 110_000_023n,
  fee = 10_000n,
  to = mockSubAccount.identifier,
}: {
  amount?: bigint;
  fee?: bigint;
  to?: string;
}): NnsTransaction => ({
  transaction_type: [{ Transfer: null }],
  memo: 0n,
  timestamp: { timestamp_nanos: 0n },
  block_height: 208n,
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
  amount = 110_000_000n,
  fee = 10_000n,
  from = mockMainAccount.identifier,
}: {
  amount?: bigint;
  fee?: bigint;
  from?: string;
}): NnsTransaction => ({
  transaction_type: [{ Transfer: null }],
  memo: 0n,
  timestamp: { timestamp_nanos: 1_652_121_288_218_078_256n },
  block_height: 208n,
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

const displayAmount = 11_000_000_000_000_000n;

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
  isPending = false,
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
  isPending,
  headline,
  otherParty,
  tokenAmount,
  timestamp,
});
