import type { IcrcTransactionsStoreData } from "$lib/stores/icrc-transactions.store";
import { AccountTransactionType } from "$lib/types/transaction";
import {
  getOldestTxIdFromStore,
  getSortedTransactionsFromStore,
  getUniqueTransactions,
  isIcrcTransactionsCompleted,
  mapIcrcTransaction,
} from "$lib/utils/icrc-transactions.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockCkBTCMainAccount } from "$tests/mocks/ckbtc-accounts.mock";
import { mockSubAccountArray } from "$tests/mocks/icp-accounts.store.mock";
import { createIcrcTransactionWithId } from "$tests/mocks/icrc-transactions.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "$tests/mocks/sns-accounts.mock";
import { principal } from "$tests/mocks/sns-projects.mock";

describe("icrc-transaction utils", () => {
  const to = {
    owner: mockPrincipal,
    subaccount: [Uint8Array.from(mockSubAccountArray)] as [Uint8Array],
  };
  const from = {
    owner: mockPrincipal,
    subaccount: [] as [],
  };
  const transactionFromMainToSubaccount = createIcrcTransactionWithId({
    to,
    from,
  });
  const recentTx = {
    id: BigInt(1234),
    transaction: {
      ...transactionFromMainToSubaccount.transaction,
      timestamp: BigInt(3000),
    },
  };
  const secondTx = {
    id: BigInt(1235),
    transaction: {
      ...transactionFromMainToSubaccount.transaction,
      timestamp: BigInt(2000),
    },
  };
  const oldestTx = {
    id: BigInt(1236),
    transaction: {
      ...transactionFromMainToSubaccount.transaction,
      timestamp: BigInt(1000),
    },
  };
  const selfTransaction = createIcrcTransactionWithId({ to, from: to });

  describe("getSortedTransactionsFromStore", () => {
    it("should return transactions sorted by date", () => {
      const transactions = [secondTx, oldestTx, recentTx];
      const store: IcrcTransactionsStoreData = {
        [mockPrincipal.toText()]: {
          [mockSnsMainAccount.identifier]: {
            transactions,
            completed: false,
            oldestTxId: BigInt(1234),
          },
        },
      };
      const data = getSortedTransactionsFromStore({
        store,
        canisterId: mockPrincipal,
        account: mockSnsMainAccount,
      });
      expect(data[0]).toEqual({
        toSelfTransaction: false,
        transaction: recentTx,
      });
      expect(data[1]).toEqual({
        toSelfTransaction: false,
        transaction: secondTx,
      });
      expect(data[2]).toEqual({
        toSelfTransaction: false,
        transaction: oldestTx,
      });
    });

    it("should duplicate selfTransaction", () => {
      const store: IcrcTransactionsStoreData = {
        [mockSnsMainAccount.principal.toText()]: {
          [mockSnsMainAccount.identifier]: {
            transactions: [selfTransaction],
            completed: false,
            oldestTxId: BigInt(1234),
          },
        },
      };
      const data = getSortedTransactionsFromStore({
        store,
        canisterId: mockPrincipal,
        account: mockSnsMainAccount,
      });
      expect(data[0]).toEqual({
        toSelfTransaction: true,
        transaction: selfTransaction,
      });
      // Only the first one should be set to true
      expect(data[1]).toEqual({
        toSelfTransaction: false,
        transaction: selfTransaction,
      });
    });
  });

  describe("mapSnsTransaction", () => {
    it("maps sent transaction", () => {
      const data = mapIcrcTransaction({
        transaction: transactionFromMainToSubaccount,
        account: mockSnsMainAccount,
        toSelfTransaction: false,
      });
      expect(data.isSend).toBe(true);
      expect(data.isReceive).toBe(false);
    });

    it("maps stake neuron transaction", () => {
      const governanceCanisterId = principal(2);
      const toGovernance = {
        owner: governanceCanisterId,
        subaccount: [Uint8Array.from([0, 0, 1])] as [Uint8Array],
      };
      const stakeNeuronTransaction = createIcrcTransactionWithId({
        to: toGovernance,
        from,
      });
      stakeNeuronTransaction.transaction.transfer[0].memo = [new Uint8Array()];
      const data = mapIcrcTransaction({
        transaction: stakeNeuronTransaction,
        account: mockSnsMainAccount,
        toSelfTransaction: false,
        governanceCanisterId,
      });
      expect(data.isSend).toBe(true);
      expect(data.isReceive).toBe(false);
      expect(data.type).toBe(AccountTransactionType.StakeNeuron);
    });

    it("maps top up neuron transaction", () => {
      const governanceCanisterId = principal(2);
      const toGovernance = {
        owner: governanceCanisterId,
        subaccount: [Uint8Array.from([0, 0, 1])] as [Uint8Array],
      };
      const topUpNeuronTransaction = createIcrcTransactionWithId({
        to: toGovernance,
        from,
      });
      topUpNeuronTransaction.transaction.transfer[0].memo = [];
      const data = mapIcrcTransaction({
        transaction: topUpNeuronTransaction,
        account: mockSnsMainAccount,
        toSelfTransaction: false,
        governanceCanisterId,
      });
      expect(data.isSend).toBe(true);
      expect(data.isReceive).toBe(false);
      expect(data.type).toBe(AccountTransactionType.TopUpNeuron);
    });

    it("maps received transaction", () => {
      const data = mapIcrcTransaction({
        transaction: transactionFromMainToSubaccount,
        account: mockSnsSubAccount,
        toSelfTransaction: false,
      });
      expect(data.isSend).toBe(false);
      expect(data.isReceive).toBe(true);
    });

    it("maps approve transaction", () => {
      const data = mapIcrcTransaction({
        transaction: {
          id: BigInt(1234),
          transaction: {
            kind: "approve",
            timestamp: BigInt(12349),
            approve: [
              {
                from,
                amount: BigInt(100_000_000),
                spender: to,
                fee: [],
                memo: [],
                created_at_time: [],
                expected_allowance: [],
                expires_at: [],
              },
            ],
            transfer: [],
            burn: [],
            mint: [],
          },
        },
        account: mockCkBTCMainAccount,
        toSelfTransaction: false,
      });
      expect(data.isSend).toBe(false);
      expect(data.isReceive).toBe(false);
    });

    it("maps self transaction", () => {
      const data = mapIcrcTransaction({
        transaction: selfTransaction,
        account: mockSnsSubAccount,
        toSelfTransaction: true,
      });
      expect(data.isSend).toBe(false);
      expect(data.isReceive).toBe(true);
    });

    it("adds fee to sent transactions", () => {
      const data = mapIcrcTransaction({
        transaction: transactionFromMainToSubaccount,
        account: mockSnsMainAccount,
        toSelfTransaction: false,
      });
      expect(data.isSend).toBe(true);
      const txData = transactionFromMainToSubaccount.transaction.transfer[0];
      expect(data.displayAmount).toBe(txData.amount + txData.fee[0]);
    });
  });

  describe("getOldestTransactionId", () => {
    const recentTx = {
      id: BigInt(1234),
      transaction: {
        ...transactionFromMainToSubaccount.transaction,
        timestamp: BigInt(3000),
      },
    };
    const secondTx = {
      id: BigInt(1235),
      transaction: {
        ...transactionFromMainToSubaccount.transaction,
        timestamp: BigInt(2000),
      },
    };
    const oldestTx = {
      id: BigInt(1236),
      transaction: {
        ...transactionFromMainToSubaccount.transaction,
        timestamp: BigInt(1000),
      },
    };

    it("returns the id of the oldest tx", () => {
      const rootCanisterId = mockSnsMainAccount.principal;
      const transactions = [secondTx, oldestTx, recentTx];
      const store: IcrcTransactionsStoreData = {
        [rootCanisterId.toText()]: {
          [mockSnsMainAccount.identifier]: {
            transactions,
            completed: false,
            oldestTxId: BigInt(1234),
          },
        },
      };
      expect(
        getOldestTxIdFromStore({
          store,
          canisterId: rootCanisterId,
          account: mockSnsMainAccount,
        })
      ).toBe(oldestTx.id);
    });

    it("returns undefined if no data is found", () => {
      expect(
        getOldestTxIdFromStore({
          store: {},
          canisterId: mockSnsMainAccount.principal,
          account: mockSnsMainAccount,
        })
      ).toBeUndefined();
    });

    it("returns undefined if empty data", () => {
      const rootCanisterId = mockSnsMainAccount.principal;
      const transactions = [];
      const store: IcrcTransactionsStoreData = {
        [rootCanisterId.toText()]: {
          [mockSnsMainAccount.identifier]: {
            transactions,
            completed: false,
            oldestTxId: BigInt(1234),
          },
        },
      };
      expect(
        getOldestTxIdFromStore({
          store,
          canisterId: rootCanisterId,
          account: mockSnsMainAccount,
        })
      ).toBeUndefined();
    });
  });

  describe("isTransactionsCompleted", () => {
    it("returns the value in store", () => {
      const rootCanisterId = mockSnsMainAccount.principal;
      const store: IcrcTransactionsStoreData = {
        [rootCanisterId.toText()]: {
          [mockSnsMainAccount.identifier]: {
            transactions: [transactionFromMainToSubaccount],
            completed: false,
            oldestTxId: BigInt(1234),
          },
          [mockSnsSubAccount.identifier]: {
            transactions: [transactionFromMainToSubaccount],
            completed: true,
            oldestTxId: BigInt(1234),
          },
        },
      };
      expect(
        isIcrcTransactionsCompleted({
          store,
          canisterId: rootCanisterId,
          account: mockSnsMainAccount,
        })
      ).toBe(false);
      expect(
        isIcrcTransactionsCompleted({
          store,
          canisterId: rootCanisterId,
          account: mockSnsSubAccount,
        })
      ).toBe(true);
    });
  });

  describe("getUniqueTransactions", () => {
    const mainAccount = {
      owner: mockPrincipal,
      subaccount: [] as [] | [Uint8Array],
    };
    const subAccount = {
      owner: mockPrincipal,
      subaccount: [new Uint8Array([1, 2, 3])] as [] | [Uint8Array],
    };
    const txA = createIcrcTransactionWithId({
      id: 1n,
      from: mainAccount,
      to: subAccount,
    });
    const txB = createIcrcTransactionWithId({
      id: 2n,
      from: subAccount,
      to: mainAccount,
    });
    const txC = createIcrcTransactionWithId({
      id: 3n,
      from: mainAccount,
      to: mainAccount,
    });

    it("empty array", () => {
      expect(getUniqueTransactions([])).toEqual([]);
    });

    it("singleton array", () => {
      const transactions = [txA];
      expect(getUniqueTransactions(transactions)).toEqual(transactions);
    });

    it("duplicate transactions", () => {
      const transactions = [txA, txA];
      expect(getUniqueTransactions(transactions)).toEqual([txA]);
    });

    it("multiple different transactions", () => {
      const transactions = [txA, txB, txC];
      expect(getUniqueTransactions(transactions)).toEqual(transactions);
    });

    it("non-consecutive duplicate transactions", () => {
      const transactions = [txA, txB, txC, txA, txC, txB, txA, txC];
      expect(getUniqueTransactions(transactions)).toEqual([txA, txB, txC]);
    });
  });
});
