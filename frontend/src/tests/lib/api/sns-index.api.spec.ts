import { getTransactions } from "$lib/api/sns-index.api";
import { mockIdentity, mockPrincipal } from "../../mocks/auth.store.mock";
import { rootCanisterIdMock } from "../../mocks/sns.api.mock";

jest.mock("$lib/proxy/api.import.proxy");
const getTransactionsSpy = jest.fn().mockResolvedValue({
  transactions: [],
  oldest_tx_id: BigInt(2),
});
jest.mock("$lib/api/sns-wrapper.api", () => {
  return {
    wrapper: () => ({
      getTransactions: getTransactionsSpy,
    }),
  };
});

describe("sns-index api", () => {
  describe("getTransactions", () => {
    it("returns the transactions from the api", async () => {
      const result = await getTransactions({
        identity: mockIdentity,
        rootCanisterId: rootCanisterIdMock,
        account: {
          owner: mockPrincipal,
        },
        maxResults: BigInt(10),
      });

      expect(result.transactions).toBeDefined();
      expect(getTransactionsSpy).toBeCalled();
    });
  });
});
