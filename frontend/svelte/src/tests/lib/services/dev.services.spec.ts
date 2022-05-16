import { getICPs } from "../../../lib/services/dev.services";
import { accountsStore } from "../../../lib/stores/accounts.store";
import { mockAccountsStoreSubscribe } from "../../mocks/accounts.store.mock";

describe("dev-services", () => {
  beforeEach(() => {
    jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe());
  });

  it("should throw an error if the environment is not testnet", async () => {
    await expect(getICPs(0.00000002)).rejects.toThrowError(
      'The environment is not "testnet"'
    );
  });
});
