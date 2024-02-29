import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
import {
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { get } from "svelte/store";

describe("accounts", () => {
  describe("nnsAccountsListStore", () => {
    it("returns nns accounts in an array", () => {
      setAccountsForTesting({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
        hardwareWallets: [],
      });

      const accounts = get(nnsAccountsListStore);
      expect(accounts).toEqual([mockMainAccount, mockSubAccount]);
    });
  });
});
