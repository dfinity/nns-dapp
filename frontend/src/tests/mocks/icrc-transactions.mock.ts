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
        created_at_time: [123n],
        amount: amount ?? 33n,
        fee: [fee ?? 1n],
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
  timestamp: 12_354n,
  burn: [],
  mint: [],
  transfer: [
    {
      to: fakeSubAccount,
      from: fakeAccount,
      memo: [],
      created_at_time: [123n],
      amount: 33n,
      fee: [1n],
      spender: [],
    },
  ],
  approve: [],
};

const mockIcrcTransactionTransferToSelf: IcrcTransaction = {
  kind: "transfer",
  timestamp: 12_354n,
  burn: [],
  mint: [],
  transfer: [
    {
      to: fakeAccount,
      from: fakeAccount,
      memo: [],
      created_at_time: [123n],
      amount: 33n,
      fee: [1n],
      spender: [],
    },
  ],
  approve: [],
};

export const createMintTransaction = ({
  timestamp = 12_354n,
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

export const createApproveTransaction = ({
  timestamp = 12_354n,
  amount = 33_000_000n,
  fee = 10_000n,
  from = fakeAccount,
  memo,
  createdAt = 123n,
  spender = fakeAccount,
}: {
  timestamp?: bigint;
  amount?: bigint;
  fee?: bigint;
  from?: IcrcCandidAccount;
  memo?: Uint8Array;
  createdAt?: bigint;
  spender?: IcrcCandidAccount;
}): IcrcTransaction => {
  return {
    kind: "approve",
    timestamp,
    approve: [
      {
        amount,
        from,
        memo: toNullable(memo),
        fee: toNullable(fee),
        created_at_time: toNullable(createdAt),
        spender: spender,
        expected_allowance: [],
        expires_at: [],
      },
    ],
    burn: [],
    mint: [],
    transfer: [],
  };
};

export const createBurnTransaction = ({
  timestamp = 12_354n,
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
  timestamp: 12_354n,
  burn: [],
  mint: [
    {
      amount: 33n,
      memo: [],
      created_at_time: [123n],
      to: fakeAccount,
    },
  ],
  transfer: [],
  approve: [],
};

export const mockIcrcTransactionWithId: IcrcTransactionWithId = {
  id: 123n,
  transaction: mockIcrcTransactionTransfer,
};

export const mockIcrcTransactionWithIdToSelf: IcrcTransactionWithId = {
  id: 124n,
  transaction: mockIcrcTransactionTransferToSelf,
};

export const mockIcrcTransactionsStoreSubscribe =
  (store: IcrcTransactionsStoreData) =>
  (run: Subscriber<IcrcTransactionsStoreData>): (() => void) => {
    run(store);

    return () => undefined;
  };
