import * as ledgerApi from "$lib/api/icrc-ledger.api";
import { universesAccountsBalance } from "$lib/derived/universes-accounts-balance.derived";
import * as services from "$lib/services/sns-accounts-balance.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { tick } from "svelte";
import { get } from "svelte/store";

describe("sns-accounts-balance.services", () => {
  const rootCanisterId = principal(1);
  const ledgerCanisterId = principal(2);

  beforeEach(() => {
    resetIdentity();

    setSnsProjects([
      {
        rootCanisterId,
        ledgerCanisterId,
      },
    ]);
  });

  it("should call api.queryIcrcBalance and load balance in store", async () => {
    const spyQuery = vi
      .spyOn(ledgerApi, "queryIcrcBalance")
      .mockResolvedValue(mockSnsMainAccount.balanceUlps);

    await services.syncSnsAccountsBalances({
      rootCanisterIds: [rootCanisterId],
    });

    await tick();

    const store = get(universesAccountsBalance);
    // Nns + 1 Sns
    expect(Object.keys(store)).toHaveLength(2);
    expect(store[rootCanisterId.toText()]).toEqual(
      mockSnsMainAccount.balanceUlps
    );
    expect(spyQuery).toBeCalled();
  });

  it("should call api.queryIcrcBalance with a query and an update call", async () => {
    const spyQuery = vi
      .spyOn(ledgerApi, "queryIcrcBalance")
      .mockResolvedValue(mockSnsMainAccount.balanceUlps);

    await services.syncSnsAccountsBalances({
      rootCanisterIds: [rootCanisterId],
    });

    await runResolvedPromises();

    expect(spyQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        canisterId: ledgerCanisterId,
        certified: false,
      })
    );
    expect(spyQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        canisterId: ledgerCanisterId,
        certified: true,
      })
    );
    expect(spyQuery).toHaveBeenCalledTimes(2);
  });

  it("should store the certified balance and not the query answer", async () => {
    const queryBalanceUlps = 1n;
    const certifiedBalanceUlps = 2n;

    vi.spyOn(ledgerApi, "queryIcrcBalance").mockImplementation(
      async ({ certified }) =>
        certified ? certifiedBalanceUlps : queryBalanceUlps
    );

    await services.syncSnsAccountsBalances({
      rootCanisterIds: [rootCanisterId],
    });

    await runResolvedPromises();

    const store = get(icrcAccountsStore);
    expect(store[ledgerCanisterId.toText()]).toMatchObject({
      certified: true,
    });
    expect(store[ledgerCanisterId.toText()].accounts[0].balanceUlps).toEqual(
      certifiedBalanceUlps
    );
  });

  it("should toast error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(ledgerApi, "queryIcrcBalance").mockRejectedValue(new Error());

    expect(get(toastsStore)).toEqual([]);

    await services.syncSnsAccountsBalances({
      rootCanisterIds: [rootCanisterId],
    });

    await runResolvedPromises();

    expect(get(toastsStore)).toMatchObject([
      {
        level: "error",
        text: "An error occurred while loading the accounts.",
      },
    ]);
  });
});
