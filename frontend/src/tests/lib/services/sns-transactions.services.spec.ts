/**
 * @jest-environment jsdom
 */

import * as indexApi from "$lib/api/sns-index.api";
import * as services from "$lib/services/sns-transactions.services";
import { snsTransactionsStore } from "$lib/stores/sns-transactions.store";
import { Principal } from "@dfinity/principal";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockSnsMainAccount } from "../../mocks/sns-accounts.mock";
import { mockSnsTransactionWithId } from "../../mocks/sns-transactions.mock";

describe("sns-transactions-services", () => {
  describe("loadAccountTransactions", () => {
    it("loads transactions in the store", async () => {
      const spyGetTransactions = jest
        .spyOn(indexApi, "getTransactions")
        .mockResolvedValue({
          oldestTxId: BigInt(1234),
          transactions: [mockSnsTransactionWithId],
        });
      const rootCanisterId = Principal.fromText("tmxop-wyaaa-aaaaa-aaapa-cai");
      await services.loadAccountTransactions({
        rootCanisterId,
        account: mockSnsMainAccount,
      });

      const snsAccount = {
        owner: mockSnsMainAccount.principal,
      };
      // await tick();
      await waitFor(() =>
        expect(spyGetTransactions).toBeCalledWith({
          identity: mockIdentity,
          account: snsAccount,
          maxResults: services.TRANSACTION_PAGE_SIZE,
        })
      );

      const storeData = get(snsTransactionsStore);
      expect(
        storeData[rootCanisterId.toText()]?.[
          mockSnsMainAccount.principal.toText()
        ].transactions[0]
      ).toEqual(mockSnsTransactionWithId);
    });
  });
});
