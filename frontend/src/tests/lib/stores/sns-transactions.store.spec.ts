import { snsTransactionsStore } from "$lib/stores/sns-transactions.store";
import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";
import { mockPrincipal } from "../../mocks/auth.store.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "../../mocks/sns-accounts.mock";
import { mockSnsTransactionWithId } from "../../mocks/sns-transactions.mock";

describe("SNS Transactions store", () => {
  describe("snsTransactionsStore", () => {
    afterEach(() => snsTransactionsStore.reset());
    it("should set transactions for a project and account when it doesn't exist", () => {
      snsTransactionsStore.addTransactions({
        rootCanisterId: mockPrincipal,
        transactions: [mockSnsTransactionWithId],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId: BigInt(10),
        completed: false,
      });

      const accountsInStore = get(snsTransactionsStore);
      expect(
        accountsInStore[mockPrincipal.toText()]?.[mockSnsMainAccount.identifier]
          ?.transactions
      ).toEqual([mockSnsTransactionWithId]);
    });

    it("should add transactions for a project and a different account", () => {
      snsTransactionsStore.addTransactions({
        rootCanisterId: mockPrincipal,
        transactions: [mockSnsTransactionWithId],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId: BigInt(10),
        completed: false,
      });

      snsTransactionsStore.addTransactions({
        rootCanisterId: mockPrincipal,
        transactions: [mockSnsTransactionWithId],
        accountIdentifier: mockSnsSubAccount.identifier,
        oldestTxId: BigInt(10),
        completed: false,
      });

      const accountsInStore = get(snsTransactionsStore);
      expect(
        accountsInStore[mockPrincipal.toText()]?.[mockSnsMainAccount.identifier]
          ?.transactions
      ).toEqual([mockSnsTransactionWithId]);
      expect(
        accountsInStore[mockPrincipal.toText()]?.[mockSnsSubAccount.identifier]
          ?.transactions
      ).toEqual([mockSnsTransactionWithId]);
    });

    it("should not add duplicated transactions", () => {
      const tx1 = {
        ...mockSnsTransactionWithId,
        id: BigInt(1),
      };
      const tx2 = {
        ...mockSnsTransactionWithId,
        id: BigInt(2),
      };
      const tx3 = {
        ...mockSnsTransactionWithId,
        id: BigInt(3),
      };
      snsTransactionsStore.addTransactions({
        rootCanisterId: mockPrincipal,
        transactions: [tx1, tx2],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId: BigInt(10),
        completed: false,
      });
      snsTransactionsStore.addTransactions({
        rootCanisterId: mockPrincipal,
        transactions: [tx1, tx3],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId: BigInt(10),
        completed: false,
      });

      const accountsInStore = get(snsTransactionsStore);
      expect(
        accountsInStore[mockPrincipal.toText()]?.[mockSnsMainAccount.identifier]
          ?.transactions.length
      ).toBe(3);
    });

    it("should reset accounts for a project", () => {
      snsTransactionsStore.addTransactions({
        rootCanisterId: mockPrincipal,
        transactions: [mockSnsTransactionWithId],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId: BigInt(10),
        completed: false,
      });

      const accountsInStore = get(snsTransactionsStore);
      expect(
        accountsInStore[mockPrincipal.toText()]?.[mockSnsMainAccount.identifier]
          ?.transactions
      ).toEqual([mockSnsTransactionWithId]);

      snsTransactionsStore.resetProject(mockPrincipal);
      const accountsInStore2 = get(snsTransactionsStore);
      expect(accountsInStore2[mockPrincipal.toText()]).toBeUndefined();
    });

    it("should add transactions for another project", () => {
      const principal2 = Principal.fromText("aaaaa-aa");

      snsTransactionsStore.addTransactions({
        rootCanisterId: mockPrincipal,
        transactions: [mockSnsTransactionWithId],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId: BigInt(10),
        completed: false,
      });
      const accountsInStore = get(snsTransactionsStore);
      expect(
        accountsInStore[mockPrincipal.toText()]?.[mockSnsMainAccount.identifier]
          ?.transactions
      ).toEqual([mockSnsTransactionWithId]);

      snsTransactionsStore.addTransactions({
        rootCanisterId: principal2,
        transactions: [mockSnsTransactionWithId],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId: BigInt(10),
        completed: false,
      });
      const accountsInStore2 = get(snsTransactionsStore);
      expect(
        accountsInStore2[mockPrincipal.toText()]?.[
          mockSnsMainAccount.identifier
        ]?.transactions
      ).toEqual([mockSnsTransactionWithId]);
      expect(
        accountsInStore2[principal2.toText()]?.[mockSnsMainAccount.identifier]
          ?.transactions
      ).toEqual([mockSnsTransactionWithId]);
    });
  });
});
