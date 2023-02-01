/**
 * @jest-environment jsdom
 */

import * as indexApi from "$lib/api/sns-index.api";
import { DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";
import * as services from "$lib/services/sns-transactions.services";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { Principal } from "@dfinity/principal";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockSnsMainAccount } from "../../mocks/sns-accounts.mock";
import { mockSnsTransactionWithId } from "../../mocks/sns-transactions.mock";

describe("sns-transactions-services", () => {
  describe("loadAccountTransactions", () => {
    beforeEach(() => {
      icrcTransactionsStore.reset();
    });
    afterEach(() => jest.clearAllMocks());
    it("loads transactions in the store", async () => {
      const spyGetTransactions = jest
        .spyOn(indexApi, "getSnsTransactions")
        .mockResolvedValue({
          oldestTxId: BigInt(1234),
          transactions: [mockSnsTransactionWithId],
        });
      const start = BigInt(1234);
      const canisterId = Principal.fromText("tmxop-wyaaa-aaaaa-aaapa-cai");
      await services.loadSnsAccountTransactions({
        canisterId,
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
          maxResults: BigInt(DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT),
          canisterId,
          start,
        })
      );

      const storeData = get(icrcTransactionsStore);
      expect(
        storeData[canisterId.toText()]?.[mockSnsMainAccount.principal.toText()]
          .transactions[0]
      ).toEqual(mockSnsTransactionWithId);
    });
  });

  describe("loadAccountNextTransactions", () => {
    beforeEach(() => {
      icrcTransactionsStore.reset();
    });
    afterEach(() => jest.clearAllMocks());
    it("loads transactions in the store", async () => {
      const spyGetTransactions = jest
        .spyOn(indexApi, "getSnsTransactions")
        .mockResolvedValue({
          oldestTxId: BigInt(1234),
          transactions: [mockSnsTransactionWithId],
        });
      const canisterId = Principal.fromText("tmxop-wyaaa-aaaaa-aaapa-cai");
      await services.loadSnsAccountNextTransactions({
        canisterId,
        account: mockSnsMainAccount,
      });

      const snsAccount = {
        owner: mockSnsMainAccount.principal,
      };

      await waitFor(() =>
        expect(spyGetTransactions).toBeCalledWith({
          identity: mockIdentity,
          account: snsAccount,
          maxResults: BigInt(DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT),
          canisterId,
        })
      );

      const storeData = get(icrcTransactionsStore);
      expect(
        storeData[canisterId.toText()]?.[mockSnsMainAccount.principal.toText()]
          .transactions[0]
      ).toEqual(mockSnsTransactionWithId);
    });

    it("uses store oldest transaction to set the start", async () => {
      const spyGetTransactions = jest
        .spyOn(indexApi, "getSnsTransactions")
        .mockResolvedValue({
          oldestTxId: BigInt(1234),
          transactions: [mockSnsTransactionWithId],
        });
      const canisterId = Principal.fromText("tmxop-wyaaa-aaaaa-aaapa-cai");
      const oldestTxId = BigInt(1234);
      icrcTransactionsStore.addTransactions({
        canisterId,
        accountIdentifier: mockSnsMainAccount.identifier,
        transactions: [mockSnsTransactionWithId],
        oldestTxId,
        completed: false,
      });
      await services.loadSnsAccountNextTransactions({
        canisterId,
        account: mockSnsMainAccount,
      });

      await waitFor(() => {
        expect(spyGetTransactions).toBeCalledWith({
          identity: mockIdentity,
          account: {
            owner: mockSnsMainAccount.principal,
          },
          maxResults: BigInt(DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT),
          canisterId,
          // TODO: It should be oldestTxId but there is a bug in the Index canister that doesn't return proper oldestTxId
          // Instead, we need to calculate the oldest by checking the transactions.
          start: mockSnsTransactionWithId.id,
        });
      });
    });
  });
});
