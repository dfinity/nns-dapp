/**
 * @jest-environment jsdom
 */

import * as indexApi from "$lib/api/sns-index.api";
import { DEFAULT_SNS_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";
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
    beforeEach(() => {
      snsTransactionsStore.reset();
    });
    afterEach(() => jest.clearAllMocks());
    it("loads transactions in the store", async () => {
      const spyGetTransactions = jest
        .spyOn(indexApi, "getTransactions")
        .mockResolvedValue({
          oldestTxId: BigInt(1234),
          transactions: [mockSnsTransactionWithId],
        });
      const start = BigInt(1234);
      const rootCanisterId = Principal.fromText("tmxop-wyaaa-aaaaa-aaapa-cai");
      await services.loadAccountTransactions({
        rootCanisterId,
        account: mockSnsMainAccount,
        start,
      });

      const snsAccount = {
        owner: mockSnsMainAccount.principal,
      };

      await waitFor(() =>
        expect(spyGetTransactions).toBeCalledWith({
          identity: mockIdentity,
          account: snsAccount,
          maxResults: BigInt(DEFAULT_SNS_TRANSACTION_PAGE_LIMIT),
          rootCanisterId,
          start,
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

  describe("loadAccountNextTransactions", () => {
    beforeEach(() => {
      snsTransactionsStore.reset();
    });
    afterEach(() => jest.clearAllMocks());
    it("loads transactions in the store", async () => {
      const spyGetTransactions = jest
        .spyOn(indexApi, "getTransactions")
        .mockResolvedValue({
          oldestTxId: BigInt(1234),
          transactions: [mockSnsTransactionWithId],
        });
      const rootCanisterId = Principal.fromText("tmxop-wyaaa-aaaaa-aaapa-cai");
      await services.loadAccountNextTransactions({
        rootCanisterId,
        account: mockSnsMainAccount,
      });

      const snsAccount = {
        owner: mockSnsMainAccount.principal,
      };

      await waitFor(() =>
        expect(spyGetTransactions).toBeCalledWith({
          identity: mockIdentity,
          account: snsAccount,
          maxResults: BigInt(DEFAULT_SNS_TRANSACTION_PAGE_LIMIT),
          rootCanisterId,
        })
      );

      const storeData = get(snsTransactionsStore);
      expect(
        storeData[rootCanisterId.toText()]?.[
          mockSnsMainAccount.principal.toText()
        ].transactions[0]
      ).toEqual(mockSnsTransactionWithId);
    });

    it("uses store oldest transaction to set the start", async () => {
      const spyGetTransactions = jest
        .spyOn(indexApi, "getTransactions")
        .mockResolvedValue({
          oldestTxId: BigInt(1234),
          transactions: [mockSnsTransactionWithId],
        });
      const rootCanisterId = Principal.fromText("tmxop-wyaaa-aaaaa-aaapa-cai");
      const oldestTxId = BigInt(1234);
      snsTransactionsStore.addTransactions({
        rootCanisterId,
        accountIdentifier: mockSnsMainAccount.identifier,
        transactions: [mockSnsTransactionWithId],
        oldestTxId,
        completed: false,
      });
      await services.loadAccountNextTransactions({
        rootCanisterId,
        account: mockSnsMainAccount,
      });

      await waitFor(() => {
        expect(spyGetTransactions).toBeCalledWith({
          identity: mockIdentity,
          account: {
            owner: mockSnsMainAccount.principal,
          },
          maxResults: BigInt(DEFAULT_SNS_TRANSACTION_PAGE_LIMIT),
          rootCanisterId,
          // TODO: It should be oldestTxId but there is a bug in the Index canister that doesn't return proper oldestTxId
          // Instead, we need to calculate the oldest by checking the transactions.
          start: mockSnsTransactionWithId.id,
        });
      });
    });
  });
});
