import type { IcrcTransactionsStoreData } from "$lib/stores/icrc-transactions.store";
import { AccountTransactionType } from "$lib/types/transaction";
import {
  getOldestTxIdFromStore,
  getSortedTransactionsFromStore,
  mapIcrcTransaction,
} from "$lib/utils/icrc-transactions.utils";
import { mockPrincipal } from "../..//mocks/auth.store.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "../..//mocks/sns-accounts.mock";
import { createIcrcTransactionWithId } from "../../mocks/icrc-transactions.mock";
import { principal } from "../../mocks/sns-projects.mock";

describe("icrc-transaction utils", () => {
  const to = {
    owner: mockPrincipal,
    subaccount: [Uint8Array.from([0, 0, 1])] as [Uint8Array],
  };
  const from = {
    owner: mockPrincipal,
    subaccount: [] as [],
  };
  const transactionFromMainToSubaccount = createIcrcTransactionWithId(to, from);
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
  const selfTransaction = createIcrcTransactionWithId(to, to);

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
      const store: IcrcTransactionsStoreData = {
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
      const stakeNeuronTransaction = createIcrcTransactionWithId(
        toGovernance,
        from
      );
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
      const topUpNeuronTransaction = createIcrcTransactionWithId(
        toGovernance,
        from
      );
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
      expect(data.displayAmount.toE8s()).toBe(txData.amount + txData.fee[0]);
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
  });
});
