/**
 * @jest-environment jsdom
 */
import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
import { accountsStore } from "$lib/stores/accounts.store";
import { get } from "svelte/store";
import { mockMainAccount } from "../../mocks/accounts.store.mock";
import { mockSnsMainAccount } from "../../mocks/sns-accounts.mock";

describe("accounts", () => {
  describe("nnsAccountsListStore", () => {
    it("returns nns accounts in an array", () => {
      accountsStore.set({
        main: mockMainAccount,
        subAccounts: [mockSnsMainAccount],
        hardwareWallets: [],
      });

      const accounts = get(nnsAccountsListStore);
      expect(accounts).toEqual([mockMainAccount, mockSnsMainAccount]);
    });
  });
});
