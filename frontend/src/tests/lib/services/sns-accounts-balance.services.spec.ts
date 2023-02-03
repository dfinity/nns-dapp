import * as ledgerApi from "$lib/api/sns-ledger.api";
import { universesAccountsBalance } from "$lib/derived/universes-accounts-balance.derived";
import * as services from "$lib/services/sns-accounts-balance.services";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { toastsError } from "$lib/stores/toasts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { tick } from "svelte";
import { get } from "svelte/store";
import { mockSnsMainAccount } from "../../mocks/sns-accounts.mock";
import {
  mockSnsSummaryList,
  mockSnsToken,
} from "../../mocks/sns-projects.mock";

jest.mock("$lib/stores/toasts.store", () => {
  return {
    toastsError: jest.fn(),
  };
});

describe("sns-accounts-balance.services", () => {
  afterEach(() => {
    jest.clearAllMocks();

    snsAccountsStore.reset();
    tokensStore.reset();
  });

  const summary = {
    ...mockSnsSummaryList[0],
    rootCanisterId: mockSnsMainAccount.principal,
    metadataCertified: false,
  };

  it("should call api.getSnsAccounts and load balance in store", async () => {
    jest
      .spyOn(ledgerApi, "getSnsToken")
      .mockImplementation(() => Promise.resolve(mockSnsToken));

    const spyQuery = jest
      .spyOn(ledgerApi, "getSnsAccounts")
      .mockImplementation(() => Promise.resolve([mockSnsMainAccount]));

    await services.uncertifiedLoadSnsAccountsBalances({
      rootCanisterIds: [mockSnsMainAccount.principal],
    });

    await tick();

    const store = get(universesAccountsBalance);
    // Nns + ckBTC + 1 Sns
    expect(Object.keys(store)).toHaveLength(3);
    expect(store[summary.rootCanisterId.toText()].balance.toE8s()).toEqual(
      mockSnsMainAccount.balance.toE8s()
    );
    expect(spyQuery).toBeCalled();
  });

  it("should call api.getSnsToken and load it in store", async () => {
    const spyQuery = jest
      .spyOn(ledgerApi, "getSnsToken")
      .mockImplementation(() => Promise.resolve(mockSnsToken));

    jest
      .spyOn(ledgerApi, "getSnsAccounts")
      .mockImplementation(() => Promise.resolve([mockSnsMainAccount]));

    await services.uncertifiedLoadSnsAccountsBalances({
      rootCanisterIds: [mockSnsMainAccount.principal],
    });

    await tick();

    const store = get(tokensStore);

    expect(store[mockSnsMainAccount.principal.toText()]).toEqual({
      token: mockSnsToken,
      certified: false,
    });

    expect(spyQuery).toBeCalled();
  });

  it("should toast error", async () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    jest.spyOn(ledgerApi, "getSnsAccounts").mockRejectedValue(new Error());

    await services.uncertifiedLoadSnsAccountsBalances({
      rootCanisterIds: [mockSnsMainAccount.principal],
    });

    expect(toastsError).toHaveBeenCalled();
  });
});
