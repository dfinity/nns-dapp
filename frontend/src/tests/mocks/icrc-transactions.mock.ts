import { NANO_SECONDS_IN_MILLISECOND } from "$lib/constants/constants";
import type { IcrcTransactionsStoreData } from "$lib/stores/icrc-transactions.store";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockSubAccountArray } from "$tests/mocks/icp-accounts.store.mock";
import type {
  IcrcTransaction,
  IcrcTransactionWithId,
} from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import { toNullable } from "@dfinity/utils";
import type { Subscriber } from "svelte/store";

export interface IcrcCandidAccount {
  owner: Principal;
  subaccount: [] | [Uint8Array];
}

export const createIcrcTransactionWithId = ({
  id,
  from,
  to,
  fee,
  amount,
  timestamp = new Date(0),
  memo,
}: {
  id?: bigint;
  to?: IcrcCandidAccount;
  from?: IcrcCandidAccount;
  fee?: bigint;
  amount?: bigint;
  timestamp?: Date;
  memo?: Uint8Array;
}): IcrcTransactionWithId => ({
  id: id ?? 123n,
  transaction: {
    kind: "transfer",
    timestamp:
      BigInt(timestamp.getTime()) * BigInt(NANO_SECONDS_IN_MILLISECOND),
    burn: [],
    mint: [],
    transfer: [
      {
        to: to ?? {
          owner: mockPrincipal,
          subaccount: [Uint8Array.from(mockSubAccountArray)],
        },
        from: from ?? {
          owner: mockPrincipal,
          subaccount: [] as [],
        },
        memo: toNullable(memo),
        created_at_time: [BigInt(123)],
        amount: amount ?? BigInt(33),
        fee: [fee ?? BigInt(1)],
        spender: [],
      },
    ],
    approve: [],
  },
});

const fakeAccount = {
  owner: Principal.fromText("aaaaa-aa"),
  subaccount: [] as [],
};

const fakeSubAccount = {
  owner: Principal.fromText("aaaaa-aa"),
  subaccount: [new Uint8Array([2, 3, 4])] as [Uint8Array],
};

const mockIcrcTransactionTransfer: IcrcTransaction = {
  kind: "transfer",
  timestamp: BigInt(12354),
  burn: [],
  mint: [],
  transfer: [
    {
      to: fakeSubAccount,
      from: fakeAccount,
      memo: [],
      created_at_time: [BigInt(123)],
      amount: BigInt(33),
      fee: [BigInt(1)],
      spender: [],
    },
  ],
  approve: [],
};

const mockIcrcTransactionTransferToSelf: IcrcTransaction = {
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
      spender: [],
    },
  ],
  approve: [],
};

export const createMintTransaction = ({
  timestamp = 12354n,
  amount = 33n,
  to = fakeAccount,
  memo,
  createdAt = 123n,
}: {
  timestamp?: bigint;
  amount?: bigint;
  to?: IcrcCandidAccount;
  memo?: Uint8Array;
  createdAt?: bigint;
}): IcrcTransaction => {
  return {
    kind: "burn",
    timestamp,
    burn: [],
    mint: [
      {
        amount,
        to,
        memo: toNullable(memo),
        created_at_time: toNullable(createdAt),
      },
    ],
    transfer: [],
    approve: [],
  };
};

export const createBurnTransaction = ({
  timestamp = 12354n,
  amount = 33n,
  from = fakeAccount,
  memo,
  createdAt = 123n,
  spender,
}: {
  timestamp?: bigint;
  amount?: bigint;
  from?: IcrcCandidAccount;
  memo?: Uint8Array;
  createdAt?: bigint;
  spender?: IcrcCandidAccount;
}): IcrcTransaction => {
  return {
    kind: "burn",
    timestamp,
    burn: [
      {
        amount,
        from,
        memo: toNullable(memo),
        created_at_time: toNullable(createdAt),
        spender: toNullable(spender),
      },
    ],
    mint: [],
    transfer: [],
    approve: [],
  };
};

export const mockIcrcTransactionBurn: IcrcTransaction = createBurnTransaction(
  {}
);

export const mockIcrcTransactionMint: IcrcTransaction = {
  kind: "mint",
  timestamp: BigInt(12354),
  burn: [],
  mint: [
    {
      amount: BigInt(33),
      memo: [],
      created_at_time: [BigInt(123)],
      to: fakeAccount,
    },
  ],
  transfer: [],
  approve: [],
};

export const mockIcrcTransactionWithId: IcrcTransactionWithId = {
  id: BigInt(123),
  transaction: mockIcrcTransactionTransfer,
};

export const mockIcrcTransactionWithIdToSelf: IcrcTransactionWithId = {
  id: BigInt(124),
  transaction: mockIcrcTransactionTransferToSelf,
};

export const mockIcrcTransactionsStoreSubscribe =
  (store: IcrcTransactionsStoreData) =>
  (run: Subscriber<IcrcTransactionsStoreData>): (() => void) => {
    run(store);

    return () => undefined;
  };
