import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
import { universesAccountsBalance } from "$lib/derived/universes-accounts-balance.derived";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import {
  mockAccountsStoreSubscribe,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockSnsFullProject } from "$tests/mocks/sns-projects.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { get } from "svelte/store";

describe("universes-accounts-balance.derived", () => {
  const rootCanisterId = mockSnsFullProject.rootCanisterId;
  const ledgerCanisterId = mockSnsFullProject.summary.ledgerCanisterId;

  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(icpAccountsStore, "subscribe").mockImplementation(
      mockAccountsStoreSubscribe([], [])
    );

    setSnsProjects([
      {
        rootCanisterId,
        ledgerCanisterId,
      },
    ]);
    icrcAccountsStore.set({
      ledgerCanisterId,
      accounts: { accounts: [mockSnsMainAccount], certified: true },
    });
  });

  it("should derive a balance of Nns accounts", () => {
    const balances = get(universesAccountsBalance);
    expect(balances[OWN_CANISTER_ID_TEXT]).toEqual(mockMainAccount.balanceUlps);
  });

  it("should derive a balance of Sns accounts", () => {
    const balances = get(universesAccountsBalance);
    expect(balances[rootCanisterId.toText()]).toEqual(
      mockSnsMainAccount.balanceUlps
    );
  });
});
