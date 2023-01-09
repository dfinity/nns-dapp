import {
  OWN_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import { selectedProjectBalance } from "$lib/derived/selected-project-balance.derived";
import { accountsStore } from "$lib/stores/accounts.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { page } from "$mocks/$app/stores";
import { get } from "svelte/store";
import { mockMainAccount } from "../../mocks/accounts.store.mock";
import { mockPrincipal } from "../../mocks/auth.store.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "../../mocks/sns-accounts.mock";

describe("selected project balance", () => {
  beforeAll(() => {
    accountsStore.set({ main: mockMainAccount, subAccounts: [] });

    snsAccountsStore.setAccounts({
      rootCanisterId: mockPrincipal,
      accounts: [mockSnsMainAccount, mockSnsSubAccount],
      certified: true,
    });
  });

  it("should return balance of Nns", () => {
    page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });

    const store = get(selectedProjectBalance);

    expect(store.canisterId.toText()).toEqual(OWN_CANISTER_ID.toText());
    expect(store.balance).not.toBeUndefined();
    expect(store.balance?.toE8s()).toEqual(mockMainAccount.balance.toE8s());
  });

  it("should return balance of Sns", () => {
    page.mock({ data: { universe: mockPrincipal.toText() } });

    const store = get(selectedProjectBalance);

    expect(store.canisterId.toText()).toEqual(mockPrincipal.toText());
    expect(store.balance).not.toBeUndefined();
    expect(store.balance?.toE8s()).toEqual(
      mockSnsMainAccount.balance.toE8s() + mockSnsSubAccount.balance.toE8s()
    );
  });
});
