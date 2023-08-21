import { addObservedIcrcTransactionsToStore } from "$lib/services/observer.services";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import {
  mockIcrcTransactionMint,
  mockIcrcTransactionWithId,
} from "$tests/mocks/icrc-transactions.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { jsonReplacer } from "@dfinity/utils";
import { get } from "svelte/store";

describe("observer.services", () => {
  const transaction = {
    canisterId: rootCanisterIdMock,
    transactions: [mockIcrcTransactionWithId],
    accountIdentifier: mockSnsMainAccount.identifier,
    oldestTxId: BigInt(10),
    completed: false,
  };

  beforeEach(() => {
    icrcTransactionsStore.addTransactions(transaction);
  });

  it("should update account store on new sync message", () => {
    const transactionsStore = get(icrcTransactionsStore);

    expect(transactionsStore[rootCanisterIdMock.toText()]).toEqual({
      [mockSnsMainAccount.identifier]: {
        transactions: transaction.transactions,
        completed: transaction.completed,
        oldestTxId: transaction.oldestTxId,
      },
    });

    const oldestTxId = transaction.oldestTxId - 1n;

    addObservedIcrcTransactionsToStore({
      universeId: rootCanisterIdMock,
      completed: true,
      transactions: [
        {
          accountIdentifier: mockSnsMainAccount.identifier,
          transactions: JSON.stringify([mockIcrcTransactionMint], jsonReplacer),
          oldestTxId,
        },
      ],
    });

    const updatedStore = get(icrcTransactionsStore);
    expect(updatedStore[rootCanisterIdMock.toText()]).toEqual({
      [mockSnsMainAccount.identifier]: {
        transactions: [...transaction.transactions, mockIcrcTransactionMint],
        completed: true,
        oldestTxId,
      },
    });
  });
});
