import * as ledgerApi from "$lib/api/wallet-ledger.api";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { universesAccountsBalance } from "$lib/derived/universes-accounts-balance.derived";
import { ckBTCTokenStore } from "$lib/derived/universes-tokens.derived";
import * as services from "$lib/services/wallet-uncertified-accounts.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { toastsError } from "$lib/stores/toasts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import { tick } from "svelte";
import { get } from "svelte/store";

vi.mock("$lib/stores/toasts.store", () => {
  return {
    toastsError: vi.fn(),
  };
});

describe("wallet-uncertified-accounts.services", () => {
  beforeEach(() => {
    resetIdentity();
  });

  afterEach(() => {
    vi.clearAllMocks();

    icrcAccountsStore.reset();
    tokensStore.reset();
  });

  const params = {
    universeIds: [
      CKBTC_UNIVERSE_CANISTER_ID.toText(),
      CKTESTBTC_UNIVERSE_CANISTER_ID.toText(),
    ],
  };

  it("should call api.getAccounts and load balance in store", async () => {
    vi.spyOn(ledgerApi, "getToken").mockImplementation(() =>
      Promise.resolve(mockCkBTCToken)
    );

    const spyQuery = vi
      .spyOn(ledgerApi, "getAccount")
      .mockImplementation(() => Promise.resolve(mockCkBTCMainAccount));

    await services.uncertifiedLoadAccountsBalance(params);

    await tick();

    const store = get(universesAccountsBalance);
    // Nns + ckBTC + ckTESTBTC
    expect(Object.keys(store)).toHaveLength(3);
    expect(store[CKBTC_UNIVERSE_CANISTER_ID.toText()].balanceUlps).toEqual(
      mockCkBTCMainAccount.balanceUlps
    );
    expect(spyQuery).toBeCalled();
  });

  it("should call api.getToken and load token in store", async () => {
    const spyQuery = vi
      .spyOn(ledgerApi, "getToken")
      .mockImplementation(() => Promise.resolve(mockCkBTCToken));

    vi.spyOn(ledgerApi, "getAccount").mockImplementation(() =>
      Promise.resolve(mockCkBTCMainAccount)
    );

    await services.uncertifiedLoadAccountsBalance(params);

    await tick();

    const store = get(ckBTCTokenStore);
    const token = {
      token: mockCkBTCToken,
      certified: false,
    };
    expect(store).toEqual({
      [CKBTC_UNIVERSE_CANISTER_ID.toText()]: token,
      [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: token,
    });

    expect(spyQuery).toBeCalled();
  });

  it("should toast error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(ledgerApi, "getAccount").mockRejectedValue(new Error());

    await services.uncertifiedLoadAccountsBalance(params);

    expect(toastsError).toHaveBeenCalled();
  });
});
