import { getTransactions } from "$lib/api/icrc-index.api";
import { mockIdentity, mockPrincipal } from "$tests/mocks/auth.store.mock";
import type { IcrcTransaction } from "@dfinity/ledger-icrc";

describe("icrc-index api", () => {
  const params = {
    identity: mockIdentity,
    account: {
      owner: mockPrincipal,
    },
    maxResults: 10n,
  };

  const transaction = {
    burn: [],
  } as unknown as IcrcTransaction;

  describe("getTransactions", () => {
    it("returns list of transaction", async () => {
      const transactions = [{ transaction, id: 1n }];

      const getTransactionsSpy = vi.fn().mockResolvedValue({
        transactions,
        oldest_tx_id: [],
      });

      const result = await getTransactions({
        ...params,
        getTransactions: getTransactionsSpy,
      });

      expect(result).not.toBeUndefined();

      expect(result.transactions).toEqual(transactions);

      expect(getTransactionsSpy).toBeCalled();
    });

    it("throws an error if no token", () => {
      const getTransactionsSpy = async () => {
        throw new Error();
      };

      const call = () =>
        getTransactions({
          ...params,
          getTransactions: getTransactionsSpy,
        });

      expect(call).rejects.toThrowError();
    });
  });
});
