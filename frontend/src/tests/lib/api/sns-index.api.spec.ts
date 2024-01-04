import { getSnsTransactions } from "$lib/api/sns-index.api";
import { mockIdentity, mockPrincipal } from "$tests/mocks/auth.store.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";

vi.mock("$lib/proxy/api.import.proxy");
const getTransactionsSpy = vi.fn().mockResolvedValue({
  transactions: [],
  oldest_tx_id: 2n,
});
vi.mock("$lib/api/sns-wrapper.api", () => {
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
        maxResults: 10n,
      });

      expect(result.transactions).toBeDefined();
      expect(getTransactionsSpy).toBeCalled();
    });
  });
});
