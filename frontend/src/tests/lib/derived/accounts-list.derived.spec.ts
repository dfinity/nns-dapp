/**
 * @jest-environment jsdom
 */
import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { get } from "svelte/store";

describe("accounts", () => {
  describe("nnsAccountsListStore", () => {
    it("returns nns accounts in an array", () => {
      icpAccountsStore.setForTesting({
        main: mockMainAccount,
        subAccounts: [mockSnsMainAccount],
        hardwareWallets: [],
      });

      const accounts = get(nnsAccountsListStore);
      expect(accounts).toEqual([mockMainAccount, mockSnsMainAccount]);
    });
  });
});
