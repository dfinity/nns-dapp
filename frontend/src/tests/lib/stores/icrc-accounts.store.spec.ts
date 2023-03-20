import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import type { Account } from "$lib/types/account";
import { mockCkBTCMainAccount } from "$tests/mocks/ckbtc-accounts.mock";
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
});
