import { getTransactions } from "$lib/api/icrc-index.api";
import type { IcrcTransaction } from "@dfinity/ledger";
import { mockIdentity, mockPrincipal } from "../../mocks/auth.store.mock";

describe("icrc-index api", () => {
  const params = {
    identity: mockIdentity,
    account: {
      owner: mockPrincipal,
    },
    maxResults: BigInt(10),
  };

  const transaction = {
    burn: [],
  } as unknown as IcrcTransaction;

  describe("getTransactions", () => {
    it("returns list of transaction", async () => {
      const transactions = [{ transaction, id: BigInt(1) }];

      const getTransactionsSpy = jest.fn().mockResolvedValue({
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
