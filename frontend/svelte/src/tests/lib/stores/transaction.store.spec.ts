import { get } from "svelte/store";
import {
  mockMainAccount,
  mockSubAccount,
} from "../../mocks/accounts.store.mock";
import { mockTransactionStore } from "../../mocks/transaction.store.mock";

describe("transaction-store", () => {
  const mock = {
    selectedAccount: mockMainAccount,
    destinationAddress: mockSubAccount.identifier,
    amount: undefined,
  };

  it("should set transaction", () => {
    mockTransactionStore.set(mock);

    const transaction = get(mockTransactionStore);
    expect(transaction).toEqual(mock);
  });

  it("should clear transaction", () => {
    mockTransactionStore.set(mock);

    const clearMock = {
      selectedAccount: undefined,
      destinationAddress: undefined,
      amount: undefined,
    };

    mockTransactionStore.set(clearMock);

    const transaction = get(mockTransactionStore);
    expect(transaction).toEqual(clearMock);
  });
});
