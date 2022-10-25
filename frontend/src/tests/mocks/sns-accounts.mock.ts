import type { SnsAccountsStore } from "$lib/stores/sns-accounts.store";
import type { Account } from "$lib/types/account";
import { TokenAmount } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import {
  encodeSnsAccount,
  type SnsTransaction,
  type SnsTransactionWithId,
} from "@dfinity/sns";
import type { Subscriber } from "svelte/store";
import { mockPrincipal } from "./auth.store.mock";

export const mockSnsMainAccount: Account = {
  identifier: encodeSnsAccount({
    owner: mockPrincipal,
  }),
  balance: TokenAmount.fromString({
    amount: "1234567.8901",
    token: {
      name: "Test",
      symbol: "TST",
    },
  }) as TokenAmount,
  principal: mockPrincipal,
  type: "main",
};

const subAccount = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 1,
];
export const mockSnsSubAccount: Account = {
  identifier: encodeSnsAccount({
    owner: mockPrincipal,
    subaccount: Uint8Array.from(subAccount),
  }),
  balance: TokenAmount.fromString({
    amount: "1234567.8901",
    token: {
      name: "Test",
      symbol: "TST",
    },
  }) as TokenAmount,
  subAccount,
  name: "test subaccount",
  type: "subAccount",
};

const mockSnsAccountsStore = (principal: Principal): SnsAccountsStore => ({
  [principal.toText()]: {
    accounts: [mockSnsMainAccount],
    certified: true,
  },
});

export const mockSnsAccountsStoreSubscribe =
  (principal: Principal = mockPrincipal) =>
  (run: Subscriber<SnsAccountsStore>): (() => void) => {
    run(mockSnsAccountsStore(principal));
    return () => undefined;
  };

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
