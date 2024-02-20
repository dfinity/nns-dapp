// Must be on top to use in hoisted vi.mock:
import { mockEnvVars } from "$tests/mocks/env-vars.mock";

import { getICPs } from "$lib/services/dev.services";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { mockAccountsStoreSubscribe } from "$tests/mocks/icp-accounts.store.mock";

vi.mock("$lib/utils/env-vars.utils", () => ({
  getEnvVars: () => mockEnvVars,
}));

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
