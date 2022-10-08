/**
 * @jest-environment jsdom
 */
import { AppPath, CONTEXT_PATH } from "$lib/constants/routes.constants";
import { accountsListStore } from "$lib/derived/accounts-list.derived";
import { accountsStore } from "$lib/stores/accounts.store";
import { routeStore } from "$lib/stores/route.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";
import { mockMainAccount } from "../../mocks/accounts.store.mock";
import { mockSnsMainAccount } from "../../mocks/sns-accounts.mock";

describe("accounts", () => {
  it("should return empty array if main is not set", () => {
    accountsStore.reset();
    const value = get(accountsListStore);
    expect(value.length).toBe(0);
  });

  it("should return the accounts of the nns", () => {
    routeStore.update({ path: AppPath.LegacyAccounts });
    accountsStore.set({ main: mockMainAccount });

    const value = get(accountsListStore);
    expect(value[0]).toEqual(mockMainAccount);
  });

  it("should return the accounts of the selected sns", () => {
    const principalString = "aaaaa-aa";
    routeStore.update({
      path: `${CONTEXT_PATH}/${principalString}/neuron/12344`,
    });
    accountsStore.set({ main: mockMainAccount });
    snsAccountsStore.setAccounts({
      rootCanisterId: Principal.fromText(principalString),
      certified: true,
      accounts: [mockSnsMainAccount],
    });
    const value = get(accountsListStore);
    expect(value[0]).toEqual(mockSnsMainAccount);
  });
});
