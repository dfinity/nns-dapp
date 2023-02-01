import type { IcrcTransactionsStoreData } from "$lib/stores/icrc-transactions.store";
import { isSnsTransactionsCompleted } from "$lib/utils/sns-transactions.utils";
import { mockPrincipal } from "../../mocks/auth.store.mock";
import { createIcrcTransactionWithId } from "../../mocks/icrc-transactions.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "../../mocks/sns-accounts.mock";

describe("sns-transactions.utils", () => {
  const to = {
    owner: mockPrincipal,
    subaccount: [Uint8Array.from([0, 0, 1])] as [Uint8Array],
  };
  const from = {
    owner: mockPrincipal,
    subaccount: [] as [],
  };
  const transactionFromMainToSubaccount = createIcrcTransactionWithId(to, from);

  describe("isTransactionsCompleted", () => {
    it("returns the value in store", () => {
      const rootCanisterId = mockSnsMainAccount.principal;
      const store: IcrcTransactionsStoreData = {
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
        isSnsTransactionsCompleted({
          store,
          rootCanisterId,
          account: mockSnsMainAccount,
        })
      ).toBe(false);
      expect(
        isSnsTransactionsCompleted({
          store,
          rootCanisterId,
          account: mockSnsSubAccount,
        })
      ).toBe(true);
    });
  });
});
