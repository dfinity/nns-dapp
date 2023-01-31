import * as ledgerApi from "$lib/api/ckbtc-ledger.api";
import { CKBTC_LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { universesAccountsBalance } from "$lib/derived/universes-accounts-balance.derived";
import * as services from "$lib/services/ckbtc-accounts-balance.services";
import { ckBTCAccountsStore } from "$lib/stores/ckbtc-accounts.store";
import { toastsError } from "$lib/stores/toasts.store";
import { tick } from "svelte";
import { get } from "svelte/store";
import { mockCkBTCMainAccount } from "../../mocks/ckbtc-accounts.mock";

jest.mock("$lib/stores/toasts.store", () => {
  return {
    toastsError: jest.fn(),
  };
});

describe("ckbtc-accounts-balance.services", () => {
  afterEach(() => {
    jest.clearAllMocks();

    ckBTCAccountsStore.reset();
  });

  it("should call api.getCkBTCAccounts and load balance in store", async () => {
    const spyQuery = jest
      .spyOn(ledgerApi, "getCkBTCAccounts")
      .mockImplementation(() => Promise.resolve([mockCkBTCMainAccount]));

    await services.uncertifiedLoadCkBTCAccountsBalance();

    await tick();

    const store = get(universesAccountsBalance);
    // Nns + ckBTC
    expect(Object.keys(store)).toHaveLength(2);
    expect(store[CKBTC_LEDGER_CANISTER_ID.toText()].balance.toE8s()).toEqual(
      mockCkBTCMainAccount.balance.toE8s()
    );
    expect(spyQuery).toBeCalled();
  });

  it("should toast error", async () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    jest.spyOn(ledgerApi, "getCkBTCAccounts").mockRejectedValue(new Error());

    await services.uncertifiedLoadCkBTCAccountsBalance();

    expect(toastsError).toHaveBeenCalled();
  });
});
