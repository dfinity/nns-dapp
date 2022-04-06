import { get } from "svelte/store";
import { transactionStore } from "../../../lib/stores/transaction.store";
import {
  mockMainAccount,
  mockSubAccount,
} from "../../mocks/accounts.store.mock";

describe("transaction-store", () => {
  const mock = {
    selectedAccount: mockMainAccount,
    destinationAddress: mockSubAccount.identifier,
  };

  it("should set transaction", () => {
    transactionStore.set(mock);

    const transaction = get(transactionStore);
    expect(transaction).toEqual(mock);
  });

  it("should clear transaction", () => {
    transactionStore.set(mock);

    const clearMock = {
      selectedAccount: undefined,
      destinationAddress: undefined,
    };

    transactionStore.set(clearMock);

    const transaction = get(transactionStore);
    expect(transaction).toEqual(clearMock);
  });
});
