import { icpTransactionsStore } from "$lib/stores/icp-transactions.store";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockTransactionWithId } from "$tests/mocks/icp-transactions.mock";
import { get } from "svelte/store";

describe("icp-transactions.store", () => {
  it("should reset account", () => {
    const otherAccountIdentifier = "otherAccountIdentifier";

    icpTransactionsStore.addTransactions({
      transactions: [mockTransactionWithId],
      accountIdentifier: mockMainAccount.identifier,
      oldestTxId: 10n,
      completed: false,
    });

    const accounts = get(icpTransactionsStore);
    expect(accounts[mockMainAccount.identifier]).not.toBeUndefined();

    icpTransactionsStore.addTransactions({
      transactions: [mockTransactionWithId],
      accountIdentifier: otherAccountIdentifier,
      oldestTxId: 10n,
      completed: false,
    });

    const accounts2 = get(icpTransactionsStore);
    expect(accounts2[otherAccountIdentifier]).not.toBeUndefined();

    icpTransactionsStore.resetAccount({
      accountIdentifier: mockMainAccount.identifier,
    });

    const accounts3 = get(icpTransactionsStore);
    expect(accounts3).not.toBeUndefined();
    expect(accounts3[mockMainAccount.identifier]).toBeUndefined();
  });

  it("should dedupe transactions", () => {
    const identifier = mockMainAccount.identifier;

    icpTransactionsStore.addTransactions({
      transactions: [mockTransactionWithId],
      accountIdentifier: identifier,
      oldestTxId: 10n,
      completed: false,
    });

    expect(get(icpTransactionsStore)[identifier].transactions.length).toBe(1);

    icpTransactionsStore.addTransactions({
      transactions: [mockTransactionWithId, mockTransactionWithId],
      accountIdentifier: identifier,
      oldestTxId: 10n,
      completed: false,
    });

    expect(get(icpTransactionsStore)[identifier].transactions.length).toBe(1);
  });
});
