import { getSnsTransactions } from "$lib/api/sns-index.api";
import { mockIdentity, mockPrincipal } from "$tests/mocks/auth.store.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";

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
      const result = await getSnsTransactions({
        identity: mockIdentity,
        canisterId: rootCanisterIdMock,
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
