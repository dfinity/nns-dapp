import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { universesAccountsStore } from "$lib/derived/universes-accounts.derived";
import { accountsStore } from "$lib/stores/accounts.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { get } from "svelte/store";
import { CKBTC_UNIVERSE_CANISTER_ID } from "../../../lib/constants/ckbtc-canister-ids.constants";
import { icrcAccountsStore } from "../../../lib/stores/icrc-accounts.store";
import {
  mockMainAccount,
  mockSubAccount,
} from "../../mocks/accounts.store.mock";
import { mockPrincipal } from "../../mocks/auth.store.mock";
import { mockCkBTCMainAccount } from "../../mocks/ckbtc-accounts.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "../../mocks/sns-accounts.mock";

describe("universes-accounts", () => {
  it("should derive Nns accounts", () => {
    accountsStore.set({
      main: mockMainAccount,
      subAccounts: [mockSubAccount],
      hardwareWallets: [],
    });

    const store = get(universesAccountsStore);
    expect(store[OWN_CANISTER_ID_TEXT]).toEqual([
      mockMainAccount,
      mockSubAccount,
    ]);
  });

  it("should derive Sns accounts", () => {
    snsAccountsStore.setAccounts({
      rootCanisterId: mockPrincipal,
      accounts: [mockSnsMainAccount, mockSnsSubAccount],
      certified: true,
    });

    const store = get(universesAccountsStore);
    expect(store[mockPrincipal.toText()]).toEqual([
      mockSnsMainAccount,
      mockSnsSubAccount,
    ]);
  });

  it("should derive ckBTC accounts", () => {
    icrcAccountsStore.set({
      accounts: {
        accounts: [mockCkBTCMainAccount],
        certified: true,
      },
      universeId: CKBTC_UNIVERSE_CANISTER_ID,
    });

    const store = get(universesAccountsStore);
    expect(store[CKBTC_UNIVERSE_CANISTER_ID.toText()]).toEqual([
      mockCkBTCMainAccount,
    ]);
  });

  it("should derive all accounts", () => {
    accountsStore.set({
      main: mockMainAccount,
      subAccounts: [mockSubAccount],
      hardwareWallets: [],
    });

    snsAccountsStore.setAccounts({
      rootCanisterId: mockPrincipal,
      accounts: [mockSnsMainAccount, mockSnsSubAccount],
      certified: true,
    });

    icrcAccountsStore.set({
      accounts: {
        accounts: [mockCkBTCMainAccount],
        certified: true,
      },
      universeId: CKBTC_UNIVERSE_CANISTER_ID,
    });

    const store = get(universesAccountsStore);
    expect(store).toEqual({
      [OWN_CANISTER_ID_TEXT]: [mockMainAccount, mockSubAccount],
      [mockPrincipal.toText()]: [mockSnsMainAccount, mockSnsSubAccount],
      [CKBTC_UNIVERSE_CANISTER_ID.toText()]: [mockCkBTCMainAccount],
    });
  });
});
