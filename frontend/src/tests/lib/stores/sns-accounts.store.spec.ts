import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import type { Account } from "$lib/types/account";
import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";
import { mockPrincipal } from "../../mocks/auth.store.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "../../mocks/sns-accounts.mock";

describe("SNS Accounts store", () => {
  describe("snsAccountsStore", () => {
    afterEach(() => snsAccountsStore.reset());
    it("should set accounts for a project", () => {
      const accounts: Account[] = [mockSnsMainAccount, mockSnsSubAccount];
      snsAccountsStore.setAccounts({
        rootCanisterId: mockPrincipal,
        accounts,
        certified: true,
      });

      const accountsInStore = get(snsAccountsStore);
      expect(accountsInStore[mockPrincipal.toText()].accounts).toEqual(
        accounts
      );
    });

    it("should reset accounts for a project", () => {
      const accounts: Account[] = [mockSnsMainAccount, mockSnsSubAccount];
      snsAccountsStore.setAccounts({
        rootCanisterId: mockPrincipal,
        accounts,
        certified: true,
      });
      snsAccountsStore.resetProject(mockPrincipal);

      const accountsInStore = get(snsAccountsStore);
      expect(accountsInStore[mockPrincipal.toText()]).toBeUndefined();
    });

    it("should add accounts for another project", () => {
      const accounts1: Account[] = [mockSnsMainAccount, mockSnsSubAccount];
      snsAccountsStore.setAccounts({
        rootCanisterId: mockPrincipal,
        accounts: accounts1,
        certified: true,
      });
      const accounts2: Account[] = [mockSnsMainAccount];
      const principal2 = Principal.fromText("aaaaa-aa");
      snsAccountsStore.setAccounts({
        rootCanisterId: principal2,
        accounts: accounts2,
        certified: true,
      });
      const accountsInStore = get(snsAccountsStore);
      expect(accountsInStore[mockPrincipal.toText()].accounts).toEqual(
        accounts1
      );
      expect(accountsInStore[principal2.toText()].accounts).toEqual(accounts2);
    });
  });
});
