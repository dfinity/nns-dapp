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
    it("should set transactions for a project and account when it doesn't exist", () => {
      icrcTransactionsStore.addTransactions({
        canisterId: mockPrincipal,
        transactions: [mockIcrcTransactionWithId],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId: 10n,
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
        oldestTxId: 10n,
        completed: false,
      });

      icrcTransactionsStore.addTransactions({
        canisterId: mockPrincipal,
        transactions: [mockIcrcTransactionWithId],
        accountIdentifier: mockSnsSubAccount.identifier,
        oldestTxId: 10n,
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
        id: 1n,
      };
      const tx2 = {
        ...mockIcrcTransactionWithId,
        id: 2n,
      };
      const tx3 = {
        ...mockIcrcTransactionWithId,
        id: 3n,
      };
      icrcTransactionsStore.addTransactions({
        canisterId: mockPrincipal,
        transactions: [tx1, tx2],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId: 10n,
        completed: false,
      });
      icrcTransactionsStore.addTransactions({
        canisterId: mockPrincipal,
        transactions: [tx1, tx3],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId: 10n,
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
        id: 1n,
      };
      const tx2 = {
        ...mockIcrcTransactionWithId,
        id: 2n,
      };
      const tx3 = {
        ...mockIcrcTransactionWithId,
        id: 3n,
      };
      const oldestTxId = 1n;
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
        oldestTxId: 3n,
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
        oldestTxId: 10n,
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
        oldestTxId: 10n,
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
        oldestTxId: 10n,
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
