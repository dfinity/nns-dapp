import * as ledgerApi from "$lib/api/sns-ledger.api";
import { universesAccountsBalance } from "$lib/derived/universes-accounts-balance.derived";
import * as services from "$lib/services/sns-accounts-balance.services";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { toastsError } from "$lib/stores/toasts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import {
  mockSnsSummaryList,
  mockSnsToken,
} from "$tests/mocks/sns-projects.mock";
import { tick } from "svelte";
import { get } from "svelte/store";

vi.mock("$lib/stores/toasts.store", () => {
  return {
    toastsError: vi.fn(),
  };
});

describe("sns-accounts-balance.services", () => {
  beforeEach(() => {
    resetIdentity();
  });

  afterEach(() => {
    vi.clearAllMocks();

    snsAccountsStore.reset();
    tokensStore.reset();
  });

  const summary = {
    ...mockSnsSummaryList[0],
    rootCanisterId: mockSnsMainAccount.principal,
    metadataCertified: false,
  };

  it("should call api.getSnsAccounts and load balance in store", async () => {
    vi.spyOn(ledgerApi, "getSnsToken").mockImplementation(() =>
      Promise.resolve(mockSnsToken)
    );

    const spyQuery = vi
      .spyOn(ledgerApi, "getSnsAccounts")
      .mockImplementation(() => Promise.resolve([mockSnsMainAccount]));

    await services.uncertifiedLoadSnsesAccountsBalances({
      rootCanisterIds: [mockSnsMainAccount.principal],
    });

    await tick();

    const store = get(universesAccountsBalance);
    // Nns + 1 Sns
    expect(Object.keys(store)).toHaveLength(2);
    expect(store[summary.rootCanisterId.toText()].balanceUlps).toEqual(
      mockSnsMainAccount.balanceUlps
    );
    expect(spyQuery).toBeCalled();
  });

  it("should toast error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(ledgerApi, "getSnsAccounts").mockRejectedValue(new Error());

    await services.uncertifiedLoadSnsesAccountsBalances({
      rootCanisterIds: [mockSnsMainAccount.principal],
    });

    expect(toastsError).toHaveBeenCalled();
  });
});
