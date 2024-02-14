import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { universesAccountsBalance } from "$lib/derived/universes-accounts-balance.derived";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
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
  vi.spyOn(icpAccountsStore, "subscribe").mockImplementation(
    mockAccountsStoreSubscribe([], [])
  );

  const rootCanisterId = mockSnsFullProject.rootCanisterId;
  const ledgerCanisterId = mockSnsFullProject.summary.ledgerCanisterId;

  beforeAll(() => {
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

  afterAll(() => {
    vi.clearAllMocks();
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
