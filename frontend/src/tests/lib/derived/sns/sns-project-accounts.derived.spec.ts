/**
 * @jest-environment jsdom
 */

import { AppPath, CONTEXT_PATH } from "$lib/constants/routes.constants";
import {snsProjectAccountsStore, snsProjectMainAccountStore} from "$lib/derived/sns/sns-project-accounts.derived";
import { routeStore } from "$lib/stores/route.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { get } from "svelte/store";
import { mockPrincipal } from "../../../mocks/auth.store.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "../../../mocks/sns-accounts.mock";

describe("sns-project-accounts store", () => {
  afterEach(() => {
    routeStore.update({
      path: AppPath.LegacyAccounts,
    });
  });
  it("should return undefined if project is not set in the store", () => {
    routeStore.update({
      path: `${CONTEXT_PATH}/${mockPrincipal.toText()}/accounts`,
    });
    snsAccountsStore.reset();
    const value = get(snsProjectAccountsStore);
    expect(value).toBeUndefined();
  });

  it("should return array of accounts of the selected project", () => {
    routeStore.update({
      path: `${CONTEXT_PATH}/${mockPrincipal.toText()}/accounts`,
    });
    const accounts = [mockSnsMainAccount, mockSnsSubAccount];
    snsAccountsStore.setAccounts({
      rootCanisterId: mockPrincipal,
      accounts,
      certified: true,
    });
    const value = get(snsProjectAccountsStore);
    expect(value?.length).toEqual(2);
  });

  it("should return first the main account", () => {
    routeStore.update({
      path: `${CONTEXT_PATH}/${mockPrincipal.toText()}/accounts`,
    });
    const accounts = [mockSnsSubAccount, mockSnsMainAccount];
    snsAccountsStore.setAccounts({
      rootCanisterId: mockPrincipal,
      accounts,
      certified: true,
    });
    const value = get(snsProjectAccountsStore);
    expect(value?.[0]?.type).toEqual("main");
  });

  describe("snsProjectMainAccountStore", () => {
    it("should return main account", () => {
      routeStore.update({
        path: `${CONTEXT_PATH}/${mockPrincipal.toText()}/accounts`,
      });
      const accounts = [mockSnsSubAccount, mockSnsMainAccount];
      snsAccountsStore.setAccounts({
        rootCanisterId: mockPrincipal,
        accounts,
        certified: true,
      });
      const value = get(snsProjectMainAccountStore);
      expect(value?.type).toEqual("main");
    });
  });
});
