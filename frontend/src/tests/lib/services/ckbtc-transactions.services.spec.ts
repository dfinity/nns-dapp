/**
 * @jest-environment jsdom
 */

import * as indexApi from "$lib/api/ckbtc-index.api";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";
import * as services from "$lib/services/ckbtc-transactions.services";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockCkBTCMainAccount } from "../../mocks/ckbtc-accounts.mock";
import { mockIcrcTransactionWithId } from "../../mocks/icrc-transactions.mock";

describe("ckbtc-transactions-services", () => {
  beforeEach(() => {
    icrcTransactionsStore.reset();
  });

  afterEach(() => jest.clearAllMocks());

  describe("loadCkBTCAccountTransactions", () => {
    it("loads transactions in the store", async () => {
      const spyGetTransactions = jest
        .spyOn(indexApi, "getCkBTCTransactions")
        .mockResolvedValue({
          oldestTxId: BigInt(1234),
          transactions: [mockIcrcTransactionWithId],
        });
      const start = BigInt(1234);

      await services.loadCkBTCAccountTransactions({
        account: mockCkBTCMainAccount,
        start,
      });

      const account = {
        owner: mockCkBTCMainAccount.principal,
      };

      await waitFor(() =>
        expect(spyGetTransactions).toBeCalledWith({
          identity: mockIdentity,
          account,
          maxResults: BigInt(DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT),
          canisterId: CKBTC_UNIVERSE_CANISTER_ID,
          start,
        })
      );

      const storeData = get(icrcTransactionsStore);
      expect(
        storeData[CKBTC_UNIVERSE_CANISTER_ID.toText()]?.[
          mockCkBTCMainAccount.principal.toText()
        ].transactions[0]
      ).toEqual(mockIcrcTransactionWithId);
    });
  });

  describe("loadCkBTCAccountNextTransactions", () => {
    it("loads transactions in the store", async () => {
      const spyGetTransactions = jest
        .spyOn(indexApi, "getCkBTCTransactions")
        .mockResolvedValue({
          oldestTxId: BigInt(1234),
          transactions: [mockIcrcTransactionWithId],
        });

      await services.loadCkBTCAccountNextTransactions({
        account: mockCkBTCMainAccount,
      });

      const account = {
        owner: mockCkBTCMainAccount.principal,
      };

      await waitFor(() =>
        expect(spyGetTransactions).toBeCalledWith({
          identity: mockIdentity,
          account,
          maxResults: BigInt(DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT),
          canisterId: CKBTC_UNIVERSE_CANISTER_ID,
        })
      );

      const storeData = get(icrcTransactionsStore);
      expect(
        storeData[CKBTC_UNIVERSE_CANISTER_ID.toText()]?.[
          mockCkBTCMainAccount.principal.toText()
        ].transactions[0]
      ).toEqual(mockIcrcTransactionWithId);
    });

    it("uses store oldest transaction to set the start", async () => {
      const spyGetTransactions = jest
        .spyOn(indexApi, "getCkBTCTransactions")
        .mockResolvedValue({
          oldestTxId: BigInt(1234),
          transactions: [mockIcrcTransactionWithId],
        });

      const oldestTxId = BigInt(1234);

      icrcTransactionsStore.addTransactions({
        canisterId: CKBTC_UNIVERSE_CANISTER_ID,
        accountIdentifier: mockCkBTCMainAccount.identifier,
        transactions: [mockIcrcTransactionWithId],
        oldestTxId,
        completed: false,
      });

      await services.loadCkBTCAccountNextTransactions({
        account: mockCkBTCMainAccount,
      });

      await waitFor(() => {
        expect(spyGetTransactions).toBeCalledWith({
          identity: mockIdentity,
          account: {
            owner: mockCkBTCMainAccount.principal,
          },
          maxResults: BigInt(DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT),
          canisterId: CKBTC_UNIVERSE_CANISTER_ID,
          // TODO: It should be oldestTxId but there is a bug in the Index canister that doesn't return proper oldestTxId
          // Instead, we need to calculate the oldest by checking the transactions.
          start: mockIcrcTransactionWithId.id,
        });
      });
    });
  });
});
