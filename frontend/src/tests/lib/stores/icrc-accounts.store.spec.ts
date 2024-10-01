import {
  CKBTC_LEDGER_CANISTER_ID,
  CKBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import type { Account } from "$lib/types/account";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockCkBTCMainAccount } from "$tests/mocks/ckbtc-accounts.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "$tests/mocks/sns-accounts.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
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
      ledgerCanisterId: CKBTC_LEDGER_CANISTER_ID,
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
      ledgerCanisterId: CKBTC_LEDGER_CANISTER_ID,
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
      ledgerCanisterId: mockPrincipal,
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
      ledgerCanisterId: mockPrincipal,
    });

    const updatedStore = get(icrcAccountsStore);

    expect(updatedStore[mockPrincipal.toText()]).toEqual({
      accounts: [mockSnsMainAccount, updateSnsSubAccount],
      certified: true,
    });
  });

  it("should reset for a project", () => {
    const ledgerCanisterId1 = principal(0);
    const ledgerCanisterId2 = principal(1);
    const accounts: Account[] = [mockSnsMainAccount, mockSnsSubAccount];
    icrcAccountsStore.set({
      accounts: {
        accounts,
        certified: true,
      },
      ledgerCanisterId: ledgerCanisterId1,
    });
    icrcAccountsStore.set({
      accounts: {
        accounts,
        certified: false,
      },
      ledgerCanisterId: ledgerCanisterId2,
    });

    expect(get(icrcAccountsStore)).toEqual({
      [ledgerCanisterId1.toText()]: {
        accounts,
        certified: true,
      },
      [ledgerCanisterId2.toText()]: {
        accounts,
        certified: false,
      },
    });

    icrcAccountsStore.resetUniverse(ledgerCanisterId1);
    expect(get(icrcAccountsStore)).toEqual({
      [ledgerCanisterId2.toText()]: {
        accounts,
        certified: false,
      },
    });

    icrcAccountsStore.resetUniverse(ledgerCanisterId2);
    expect(get(icrcAccountsStore)).toEqual({});
  });
});
