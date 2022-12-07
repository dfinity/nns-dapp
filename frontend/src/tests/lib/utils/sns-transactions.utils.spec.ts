import type { SnsTransactionsStore } from "$lib/stores/sns-transactions.store";
import {
  getOldestTxIdFromStore,
  getSortedTransactionsFromStore,
  isTransactionsCompleted,
  mapSnsTransaction,
} from "$lib/utils/sns-transactions.utils";
import { AccountTransactionType } from "$lib/utils/transactions.utils";
import { mockPrincipal } from "../..//mocks/auth.store.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "../..//mocks/sns-accounts.mock";
import { principal } from "../../mocks/sns-projects.mock";
import { createSnstransactionWithId } from "../../mocks/sns-transactions.mock";

describe("sns-transaction utils", () => {
  const to = {
    owner: mockPrincipal,
    subaccount: [Uint8Array.from([0, 0, 1])] as [Uint8Array],
  };
  const from = {
    owner: mockPrincipal,
    subaccount: [] as [],
  };
  const transactionFromMainToSubaccount = createSnstransactionWithId(to, from);
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
  const selfTransaction = createSnstransactionWithId(to, to);

  describe("getSortedTransactionsFromStore", () => {
    it("should return transactions sorted by date", () => {
      const transactions = [secondTx, oldestTx, recentTx];
      const store: SnsTransactionsStore = {
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
        rootCanisterId: mockPrincipal,
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

    it("should set selfTransaction to true", () => {
      const store: SnsTransactionsStore = {
        [mockSnsMainAccount.principal.toText()]: {
          [mockSnsMainAccount.identifier]: {
            transactions: [selfTransaction, selfTransaction],
            completed: false,
            oldestTxId: BigInt(1234),
          },
        },
      };
      const data = getSortedTransactionsFromStore({
        store,
        rootCanisterId: mockPrincipal,
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

  describe("isTransactionsCompleted", () => {
    it("returns the value in store", () => {
      const rootCanisterId = mockSnsMainAccount.principal;
      const store: SnsTransactionsStore = {
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
        isTransactionsCompleted({
          store,
          rootCanisterId,
          account: mockSnsMainAccount,
        })
      ).toBe(false);
      expect(
        isTransactionsCompleted({
          store,
          rootCanisterId,
          account: mockSnsSubAccount,
        })
      ).toBe(true);
    });
  });

  describe("getOldestTransactionId", () => {
    it("returns the id of the oldest tx", () => {
      const rootCanisterId = mockSnsMainAccount.principal;
      const transactions = [secondTx, oldestTx, recentTx];
      const store: SnsTransactionsStore = {
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
          rootCanisterId,
          account: mockSnsMainAccount,
        })
      ).toBe(oldestTx.id);
    });

    it("returns undefined if no data is found", () => {
      expect(
        getOldestTxIdFromStore({
          store: {},
          rootCanisterId: mockSnsMainAccount.principal,
          account: mockSnsMainAccount,
        })
      ).toBeUndefined();
    });
  });

  describe("mapSnsTransaction", () => {
    it("maps sent transaction", () => {
      const data = mapSnsTransaction({
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
      const stakeNeuronTransaction = createSnstransactionWithId(
        toGovernance,
        from
      );
      const data = mapSnsTransaction({
        transaction: stakeNeuronTransaction,
        account: mockSnsMainAccount,
        toSelfTransaction: false,
        governanceCanisterId,
      });
      expect(data.isSend).toBe(true);
      expect(data.isReceive).toBe(false);
      expect(data.type).toBe(AccountTransactionType.StakeNeuron);
    });

    it("maps received transaction", () => {
      const data = mapSnsTransaction({
        transaction: transactionFromMainToSubaccount,
        account: mockSnsSubAccount,
        toSelfTransaction: false,
      });
      expect(data.isSend).toBe(false);
      expect(data.isReceive).toBe(true);
    });

    it("maps self transaction", () => {
      const data = mapSnsTransaction({
        transaction: selfTransaction,
        account: mockSnsSubAccount,
        toSelfTransaction: true,
      });
      expect(data.isSend).toBe(false);
      expect(data.isReceive).toBe(true);
    });

    it("adds fee to sent transactions", () => {
      const data = mapSnsTransaction({
        transaction: transactionFromMainToSubaccount,
        account: mockSnsMainAccount,
        toSelfTransaction: false,
      });
      expect(data.isSend).toBe(true);
      const txData = transactionFromMainToSubaccount.transaction.transfer[0];
      expect(data.displayAmount.toE8s()).toBe(txData.amount + txData.fee[0]);
    });
  });
});
