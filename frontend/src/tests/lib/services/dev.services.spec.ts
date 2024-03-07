import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
import { getICPs } from "$lib/services/dev.services";
import { mockAccountsStoreSubscribe } from "$tests/mocks/icp-accounts.store.mock";

describe("dev-services", () => {
  beforeEach(() => {
    vi.spyOn(icpAccountsStore, "subscribe").mockImplementation(
      mockAccountsStoreSubscribe()
    );
  });

  it("should throw an error if the environment is not testnet", async () => {
    await expect(getICPs(2)).rejects.toThrowError(
      'The environment is not "testnet"'
    );
  });
});
