import * as indexApi from "$lib/api/sns-index.api";
import { DEFAULT_ICRC_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";
import * as services from "$lib/services/sns-transactions.services";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockIcrcTransactionWithId } from "$tests/mocks/icrc-transactions.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { Principal } from "@dfinity/principal";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("sns-transactions-services", () => {
  beforeEach(() => {
    resetIdentity();
  });
  describe("loadSnsAccountTransactions", () => {
    beforeEach(() => {
      icrcTransactionsStore.reset();
    });
    afterEach(() => {
      vi.clearAllMocks();
    });
    it("loads transactions in the store", async () => {
      const spyGetTransactions = vi
        .spyOn(indexApi, "getSnsTransactions")
        .mockResolvedValue({
          oldestTxId: 1_234n,
          transactions: [mockIcrcTransactionWithId],
        });
      const start = 1_234n;
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
      ).toEqual(mockIcrcTransactionWithId);
    });
  });
});
