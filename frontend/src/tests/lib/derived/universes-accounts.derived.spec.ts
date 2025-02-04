import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import {
  CKBTC_LEDGER_CANISTER_ID,
  CKBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { universesAccountsStore } from "$lib/derived/universes-accounts.derived";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { mockCkBTCMainAccount } from "$tests/mocks/ckbtc-accounts.mock";
import {
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "$tests/mocks/sns-accounts.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { get } from "svelte/store";

describe("universes-accounts", () => {
  it("should derive Nns accounts", () => {
    setAccountsForTesting({
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
    const rootCanisterId = principal(1);
    const ledgerCanisterId = principal(2);
    setSnsProjects([
      {
        rootCanisterId,
        ledgerCanisterId,
      },
    ]);
    icrcAccountsStore.set({
      ledgerCanisterId,
      accounts: {
        accounts: [mockSnsMainAccount, mockSnsSubAccount],
        certified: true,
      },
    });

    const store = get(universesAccountsStore);
    expect(store[rootCanisterId.toText()]).toEqual([
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
      ledgerCanisterId: CKBTC_LEDGER_CANISTER_ID,
    });

    const store = get(universesAccountsStore);
    expect(store[CKBTC_UNIVERSE_CANISTER_ID.toText()]).toEqual([
      mockCkBTCMainAccount,
    ]);
  });

  it("should derive all accounts", () => {
    setAccountsForTesting({
      main: mockMainAccount,
      subAccounts: [mockSubAccount],
      hardwareWallets: [],
    });

    const rootCanisterId = principal(1);
    const snsLedgerCanisterId = principal(2);
    setSnsProjects([
      {
        rootCanisterId,
        ledgerCanisterId: snsLedgerCanisterId,
      },
    ]);
    icrcAccountsStore.set({
      ledgerCanisterId: snsLedgerCanisterId,
      accounts: {
        accounts: [mockSnsMainAccount, mockSnsSubAccount],
        certified: true,
      },
    });

    icrcAccountsStore.set({
      accounts: {
        accounts: [mockCkBTCMainAccount],
        certified: true,
      },
      ledgerCanisterId: CKBTC_LEDGER_CANISTER_ID,
    });

    const store = get(universesAccountsStore);
    expect(store).toEqual({
      [OWN_CANISTER_ID_TEXT]: [mockMainAccount, mockSubAccount],
      [rootCanisterId.toText()]: [mockSnsMainAccount, mockSnsSubAccount],
      [CKBTC_UNIVERSE_CANISTER_ID.toText()]: [mockCkBTCMainAccount],
    });
  });
});
