import * as ledgerApi from "$lib/api/sns-ledger.api";
import * as services from "$lib/services/sns-accounts-balance.services";
import { snsAccountsBalanceStore } from "$lib/stores/sns-accounts-balance.store";
import { toastsError } from "$lib/stores/toasts.store";
import { tick } from "svelte";
import { get } from "svelte/store";
import { mockSnsMainAccount } from "../../mocks/sns-accounts.mock";
import { mockSnsSummaryList } from "../../mocks/sns-projects.mock";

jest.mock("$lib/stores/toasts.store", () => {
  return {
    toastsError: jest.fn(),
  };
});

describe("sns-accounts-balance.services", () => {
  afterEach(() => {
    jest.clearAllMocks();

    snsAccountsBalanceStore.reset();
  });

  const summary = {
    ...mockSnsSummaryList[0],
    rootCanisterId: mockSnsMainAccount.principal,
    metadataCertified: false,
  };

  it("should call api.getSnsAccounts and load balance in store", async () => {
    const spyQuery = jest
      .spyOn(ledgerApi, "getSnsAccounts")
      .mockImplementation(() => Promise.resolve([mockSnsMainAccount]));

    await services.uncertifiedLoadSnsAccountsBalances({ summaries: [summary] });

    await tick();

    const store = get(snsAccountsBalanceStore);
    expect(Object.keys(store)).toHaveLength(1);
    expect(store[summary.rootCanisterId.toText()].balance.toE8s()).toEqual(
      mockSnsMainAccount.balance.toE8s()
    );
    expect(spyQuery).toBeCalled();
  });

  it("should not call api.getSnsAccounts and load balance in store if summaries are certified", async () => {
    const spyQuery = jest
      .spyOn(ledgerApi, "getSnsAccounts")
      .mockImplementation(() => Promise.resolve([mockSnsMainAccount]));

    const certifiedSummary = {
      ...summary,
      metadataCertified: true,
    };

    await services.uncertifiedLoadSnsAccountsBalances({
      summaries: [certifiedSummary],
    });

    await tick();

    const store = get(snsAccountsBalanceStore);
    expect(Object.keys(store)).toHaveLength(0);
    expect(spyQuery).not.toHaveBeenCalled();
  });

  it("should toast error", async () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    jest.spyOn(ledgerApi, "getSnsAccounts").mockRejectedValue(new Error());

    await services.uncertifiedLoadSnsAccountsBalances({ summaries: [summary] });

    expect(toastsError).toHaveBeenCalled();
  });

  it("should set a balance to null on error", async () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    jest.spyOn(ledgerApi, "getSnsAccounts").mockRejectedValue(new Error());

    await services.uncertifiedLoadSnsAccountsBalances({ summaries: [summary] });

    const store = get(snsAccountsBalanceStore);
    expect(store[summary.rootCanisterId.toText()].balance).toBeNull();
  });
});
