import { getICPs } from "$lib/services/dev.services";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { mockAccountsStoreSubscribe } from "$tests/mocks/icp-accounts.store.mock";

describe("dev-services", () => {
  beforeEach(() => {
    vi.spyOn(icpAccountsStore, "subscribe").mockImplementation(
      mockAccountsStoreSubscribe()
    );
  });

  it("should throw an error if the environment is not testnet", async () => {
    await expect(getICPs(0.00000002)).rejects.toThrowError(
      'The environment is not "testnet"'
    );
  });
});
