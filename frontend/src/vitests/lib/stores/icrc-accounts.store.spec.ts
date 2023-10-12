import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import type { Account } from "$lib/types/account";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockCkBTCMainAccount } from "$tests/mocks/ckbtc-accounts.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "$tests/mocks/sns-accounts.mock";
import { get } from "svelte/store";

describe("icrc Accounts store", () => {
  afterEach(() => icrcAccountsStore.reset());

  const accounts: Account[] = [mockCkBTCMainAccount];

  it("should set accounts", () => {
    icrcAccountsStore.set({
      accounts: {
        accounts,
        certified: true,
      },
      universeId: CKBTC_UNIVERSE_CANISTER_ID,
    });

    const accountsInStore = get(icrcAccountsStore);
    expect(
      accountsInStore[CKBTC_UNIVERSE_CANISTER_ID.toText()].accounts
    ).toEqual(accounts);
    expect(
      accountsInStore[CKBTC_UNIVERSE_CANISTER_ID.toText()].certified
    ).toBeTruthy();
  });

  it("should reset accounts", () => {
    icrcAccountsStore.set({
      accounts: {
        accounts,
        certified: true,
      },
      universeId: CKBTC_UNIVERSE_CANISTER_ID,
    });

    icrcAccountsStore.reset();

    const accountsInStore = get(icrcAccountsStore);
    expect(
      accountsInStore[CKBTC_UNIVERSE_CANISTER_ID.toText()]
    ).toBeUndefined();
  });

  it("should update accounts for a project", () => {
    const accounts: Account[] = [mockSnsMainAccount, mockSnsSubAccount];
    icrcAccountsStore.set({
      accounts: {
        accounts,
        certified: true,
      },
      universeId: mockPrincipal,
    });

    const accountsInStore = get(icrcAccountsStore);
    expect(accountsInStore[mockPrincipal.toText()]).toEqual({
      accounts,
      certified: true,
    });

    const updateSnsSubAccount = {
      ...mockSnsSubAccount,
      balanceE8s: 123n,
    };

    icrcAccountsStore.update({
      accounts: {
        accounts: [updateSnsSubAccount],
        certified: true,
      },
      universeId: mockPrincipal,
    });

    const updatedStore = get(icrcAccountsStore);

    expect(updatedStore[mockPrincipal.toText()]).toEqual({
      accounts: [mockSnsMainAccount, updateSnsSubAccount],
      certified: true,
    });
  });
});
