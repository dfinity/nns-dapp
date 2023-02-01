import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
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
    afterEach(() => icrcTransactionsStore.reset());
    it("should set transactions for a project and account when it doesn't exist", () => {
      icrcTransactionsStore.addTransactions({
        canisterId: mockPrincipal,
        transactions: [mockSnsTransactionWithId],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId: BigInt(10),
        completed: false,
      });

      const accountsInStore = get(icrcTransactionsStore);
      expect(
        accountsInStore[mockPrincipal.toText()]?.[mockSnsMainAccount.identifier]
          ?.transactions
      ).toEqual([mockSnsTransactionWithId]);
    });

    it("should add transactions for a project and a different account", () => {
      icrcTransactionsStore.addTransactions({
        canisterId: mockPrincipal,
        transactions: [mockSnsTransactionWithId],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId: BigInt(10),
        completed: false,
      });

      icrcTransactionsStore.addTransactions({
        canisterId: mockPrincipal,
        transactions: [mockSnsTransactionWithId],
        accountIdentifier: mockSnsSubAccount.identifier,
        oldestTxId: BigInt(10),
        completed: false,
      });

      const accountsInStore = get(icrcTransactionsStore);
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
        transactions: [mockSnsTransactionWithId],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId: BigInt(10),
        completed: false,
      });

      const accountsInStore = get(icrcTransactionsStore);
      expect(
        accountsInStore[mockPrincipal.toText()]?.[mockSnsMainAccount.identifier]
          ?.transactions
      ).toEqual([mockSnsTransactionWithId]);

      icrcTransactionsStore.resetUniverse(mockPrincipal);
      const accountsInStore2 = get(icrcTransactionsStore);
      expect(accountsInStore2[mockPrincipal.toText()]).toBeUndefined();
    });

    it("should add transactions for another project", () => {
      const principal2 = Principal.fromText("aaaaa-aa");

      icrcTransactionsStore.addTransactions({
        canisterId: mockPrincipal,
        transactions: [mockSnsTransactionWithId],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId: BigInt(10),
        completed: false,
      });
      const accountsInStore = get(icrcTransactionsStore);
      expect(
        accountsInStore[mockPrincipal.toText()]?.[mockSnsMainAccount.identifier]
          ?.transactions
      ).toEqual([mockSnsTransactionWithId]);

      icrcTransactionsStore.addTransactions({
        canisterId: principal2,
        transactions: [mockSnsTransactionWithId],
        accountIdentifier: mockSnsMainAccount.identifier,
        oldestTxId: BigInt(10),
        completed: false,
      });
      const accountsInStore2 = get(icrcTransactionsStore);
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
