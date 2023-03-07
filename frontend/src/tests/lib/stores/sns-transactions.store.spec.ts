import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockIcrcTransactionWithId } from "$tests/mocks/icrc-transactions.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "$tests/mocks/sns-accounts.mock";
import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";

describe("SNS Transactions store", () => {
  describe("snsTransactionsStore", () => {
    afterEach(() => icrcTransactionsStore.reset());
    it("should set transactions for a project and account when it doesn't exist", () => {
      icrcTransactionsStore.addTransactions({
        canisterId: mockPrincipal,
        transactions: [mockIcrcTransactionWithId],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId: BigInt(10),
        completed: false,
      });

      const accountsInStore = get(icrcTransactionsStore);
      expect(
        accountsInStore[mockPrincipal.toText()]?.[mockSnsMainAccount.identifier]
          ?.transactions
      ).toEqual([mockIcrcTransactionWithId]);
    });

    it("should add transactions for a project and a different account", () => {
      icrcTransactionsStore.addTransactions({
        canisterId: mockPrincipal,
        transactions: [mockIcrcTransactionWithId],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId: BigInt(10),
        completed: false,
      });

      icrcTransactionsStore.addTransactions({
        canisterId: mockPrincipal,
        transactions: [mockIcrcTransactionWithId],
        accountIdentifier: mockSnsSubAccount.identifier,
        oldestTxId: BigInt(10),
        completed: false,
      });

      const accountsInStore = get(icrcTransactionsStore);
      expect(
        accountsInStore[mockPrincipal.toText()]?.[mockSnsMainAccount.identifier]
          ?.transactions
      ).toEqual([mockIcrcTransactionWithId]);
      expect(
        accountsInStore[mockPrincipal.toText()]?.[mockSnsSubAccount.identifier]
          ?.transactions
      ).toEqual([mockIcrcTransactionWithId]);
    });

    it("should not add duplicated transactions", () => {
      const tx1 = {
        ...mockIcrcTransactionWithId,
        id: BigInt(1),
      };
      const tx2 = {
        ...mockIcrcTransactionWithId,
        id: BigInt(2),
      };
      const tx3 = {
        ...mockIcrcTransactionWithId,
        id: BigInt(3),
      };
      icrcTransactionsStore.addTransactions({
        canisterId: mockPrincipal,
        transactions: [tx1, tx2],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId: BigInt(10),
        completed: false,
      });
      icrcTransactionsStore.addTransactions({
        canisterId: mockPrincipal,
        transactions: [tx1, tx3],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId: BigInt(10),
        completed: false,
      });

      const accountsInStore = get(icrcTransactionsStore);
      expect(
        accountsInStore[mockPrincipal.toText()]?.[mockSnsMainAccount.identifier]
          ?.transactions.length
      ).toBe(3);
    });

    it("should not change txOldestId if not oldest", () => {
      const tx1 = {
        ...mockIcrcTransactionWithId,
        id: BigInt(1),
      };
      const tx2 = {
        ...mockIcrcTransactionWithId,
        id: BigInt(2),
      };
      const tx3 = {
        ...mockIcrcTransactionWithId,
        id: BigInt(3),
      };
      const oldestTxId = BigInt(1);
      icrcTransactionsStore.addTransactions({
        canisterId: mockPrincipal,
        transactions: [tx1, tx2],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId,
        completed: false,
      });
      icrcTransactionsStore.addTransactions({
        canisterId: mockPrincipal,
        transactions: [tx1, tx3],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId: BigInt(3),
        completed: false,
      });

      const accountsInStore = get(icrcTransactionsStore);
      expect(
        accountsInStore[mockPrincipal.toText()]?.[mockSnsMainAccount.identifier]
          ?.oldestTxId
      ).toBe(oldestTxId);
    });

    it("should reset accounts for a project", () => {
      icrcTransactionsStore.addTransactions({
        canisterId: mockPrincipal,
        transactions: [mockIcrcTransactionWithId],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId: BigInt(10),
        completed: false,
      });

      const accountsInStore = get(icrcTransactionsStore);
      expect(
        accountsInStore[mockPrincipal.toText()]?.[mockSnsMainAccount.identifier]
          ?.transactions
      ).toEqual([mockIcrcTransactionWithId]);

      icrcTransactionsStore.resetUniverse(mockPrincipal);
      const accountsInStore2 = get(icrcTransactionsStore);
      expect(accountsInStore2[mockPrincipal.toText()]).toBeUndefined();
    });

    it("should add transactions for another project", () => {
      const principal2 = Principal.fromText("aaaaa-aa");

      icrcTransactionsStore.addTransactions({
        canisterId: mockPrincipal,
        transactions: [mockIcrcTransactionWithId],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId: BigInt(10),
        completed: false,
      });
      const accountsInStore = get(icrcTransactionsStore);
      expect(
        accountsInStore[mockPrincipal.toText()]?.[mockSnsMainAccount.identifier]
          ?.transactions
      ).toEqual([mockIcrcTransactionWithId]);

      icrcTransactionsStore.addTransactions({
        canisterId: principal2,
        transactions: [mockIcrcTransactionWithId],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId: BigInt(10),
        completed: false,
      });
      const accountsInStore2 = get(icrcTransactionsStore);
      expect(
        accountsInStore2[mockPrincipal.toText()]?.[
          mockSnsMainAccount.identifier
        ]?.transactions
      ).toEqual([mockIcrcTransactionWithId]);
      expect(
        accountsInStore2[principal2.toText()]?.[mockSnsMainAccount.identifier]
          ?.transactions
      ).toEqual([mockIcrcTransactionWithId]);
    });
  });
});
