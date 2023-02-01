import * as ledgerApi from "$lib/api/ckbtc-ledger.api";
import { loadCkBTCAccounts } from "$lib/services/ckbtc-accounts.services";
import { ckBTCAccountsStore } from "$lib/stores/ckbtc-accounts.store";
import { tick } from "svelte";
import { get } from "svelte/store";
import { mockCkBTCMainAccount } from "../../mocks/ckbtc-accounts.mock";

describe("ckbtc-accounts-services", () => {
  describe("loadSnsAccounts", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      ckBTCAccountsStore.reset();
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it("should call api.getSnsAccounts and load neurons in store", async () => {
      const spyQuery = jest
        .spyOn(ledgerApi, "getCkBTCAccounts")
        .mockImplementation(() => Promise.resolve([mockCkBTCMainAccount]));

      await loadCkBTCAccounts({});

      await tick();

      const store = get(ckBTCAccountsStore);

      expect(store.accounts).toHaveLength(1);
      expect(spyQuery).toBeCalled();

      spyQuery.mockClear();
    });

    it("should call error callback", async () => {
      const spyQuery = jest
        .spyOn(ledgerApi, "getCkBTCAccounts")
        .mockRejectedValue(new Error());

      const spy = jest.fn();

      await loadCkBTCAccounts({
        handleError: spy,
      });

      expect(spy).toBeCalled();

      spyQuery.mockClear();
    });

    it("should empty store if update call fails", async () => {
      ckBTCAccountsStore.set({
        accounts: [mockCkBTCMainAccount],
        certified: true,
      });

      jest
        .spyOn(ledgerApi, "getCkBTCAccounts")
        .mockImplementation(() => Promise.reject(undefined));

      await loadCkBTCAccounts({});

      const store = get(ckBTCAccountsStore);
      expect(store.accounts).toHaveLength(0);
    });
  });
});
