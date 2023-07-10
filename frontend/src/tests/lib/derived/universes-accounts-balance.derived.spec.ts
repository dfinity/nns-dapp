import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { universesAccountsBalance } from "$lib/derived/universes-accounts-balance.derived";
import { accountsStore } from "$lib/stores/accounts.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import {
  mockAccountsStoreSubscribe,
  mockMainAccount,
} from "$tests/mocks/accounts.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockSnsFullProject } from "$tests/mocks/sns-projects.mock";
import { get } from "svelte/store";
import { vi } from "vitest";

describe("universes-accounts-balance.derived", () => {
  vi.spyOn(accountsStore, "subscribe").mockImplementation(
    mockAccountsStoreSubscribe([], [])
  );

  const rootCanisterId = mockSnsFullProject.rootCanisterId;

  beforeAll(() => {
    snsAccountsStore.setAccounts({
      rootCanisterId,
      accounts: [mockSnsMainAccount],
      certified: true,
    });
  });

  afterAll(() => vi.clearAllMocks());

  it("should derive a balance of Nns accounts", () => {
    const balances = get(universesAccountsBalance);
    expect(balances[OWN_CANISTER_ID_TEXT].balanceE8s).toEqual(
      mockMainAccount.balanceE8s
    );
  });

  it("should derive a balance of Sns accounts", () => {
    const balances = get(universesAccountsBalance);
    expect(balances[rootCanisterId.toText()].balanceE8s).toEqual(
      mockSnsMainAccount.balanceE8s
    );
  });
});
