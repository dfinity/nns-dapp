/**
 * @jest-environment jsdom
 */
import { getICPs } from "$lib/services/dev.services";
import { ENABLE_ICP_ICRC } from "$lib/stores/feature-flags.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { mockAccountsStoreSubscribe } from "$tests/mocks/icp-accounts.store.mock";
import { get } from "svelte/store";

describe("dev-services", () => {
  beforeEach(() => {
    jest
      .spyOn(icpAccountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe());
  });

  it("should throw an error if the environment is not testnet", async () => {
    await expect(
      getICPs({ icps: 0.00000002, icrcEnabled: get(ENABLE_ICP_ICRC) })
    ).rejects.toThrowError('The environment is not "testnet"');
  });
});
