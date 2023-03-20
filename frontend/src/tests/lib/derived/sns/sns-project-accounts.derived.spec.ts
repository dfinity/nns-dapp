/**
 * @jest-environment jsdom
 */

import {
  snsProjectAccountsStore,
  snsProjectMainAccountStore,
} from "$lib/derived/sns/sns-project-accounts.derived";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import { page } from "$mocks/$app/stores";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "$tests/mocks/sns-accounts.mock";
import { snsResponseFor } from "$tests/mocks/sns-response.mock";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";

describe("sns-project-accounts store", () => {
  beforeEach(() => {
    snsQueryStore.reset();
    snsQueryStore.setData(
      snsResponseFor({
        principal: mockPrincipal,
        lifecycle: SnsSwapLifecycle.Committed,
      })
    );
    page.mock({ data: { universe: mockPrincipal.toText() } });
  });

  it("should return undefined if project is not set in the store", () => {
    snsAccountsStore.reset();
    const value = get(snsProjectAccountsStore);
    expect(value).toBeUndefined();
  });

  it("should return array of accounts of the selected project", () => {
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
