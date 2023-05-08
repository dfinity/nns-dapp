/**
 * @jest-environment jsdom
 */
import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
import { accountsStore } from "$lib/stores/accounts.store";
import { mockMainAccount } from "$tests/mocks/accounts.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { get } from "svelte/store";

describe("accounts", () => {
  describe("nnsAccountsListStore", () => {
    it("returns nns accounts in an array", () => {
      accountsStore.setForTesting({
        main: mockMainAccount,
        subAccounts: [mockSnsMainAccount],
        hardwareWallets: [],
      });

      const accounts = get(nnsAccountsListStore);
      expect(accounts).toEqual([mockMainAccount, mockSnsMainAccount]);
    });
  });
});
