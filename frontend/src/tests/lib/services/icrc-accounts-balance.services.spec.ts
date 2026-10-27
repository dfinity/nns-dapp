import * as icrcLegerApi from "$lib/api/icrc-ledger.api";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { universesAccountsBalance } from "$lib/derived/universes-accounts-balance.derived";
import { ckBTCTokenStore } from "$lib/derived/universes-tokens.derived";
import * as services from "$lib/services/icrc-accounts-balance.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import * as toastsStore from "$lib/stores/toasts.store";
import { toastsError } from "$lib/stores/toasts.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { get } from "svelte/store";

describe("icrc-accounts-balance.services", () => {
  beforeEach(() => {
    resetIdentity();
    vi.spyOn(toastsStore, "toastsError");
  });

  const params = {
    universeIds: [
      CKBTC_UNIVERSE_CANISTER_ID.toText(),
      CKTESTBTC_UNIVERSE_CANISTER_ID.toText(),
    ],
  };

  it("should call api.queryIcrcBalance and load balance in store", async () => {
    vi.spyOn(icrcLegerApi, "queryIcrcToken").mockResolvedValue(mockCkBTCToken);

    const spyQuery = vi
      .spyOn(icrcLegerApi, "queryIcrcBalance")
      .mockResolvedValue(mockCkBTCMainAccount.balanceUlps);

    await services.syncIcrcAccountsBalances(params);

    const store = get(universesAccountsBalance);
    // Nns + ckBTC + ckTESTBTC
    expect(Object.keys(store)).toHaveLength(3);
    expect(store[CKBTC_UNIVERSE_CANISTER_ID.toText()]).toEqual(
      mockCkBTCMainAccount.balanceUlps
    );
    expect(spyQuery).toBeCalled();
  });

  it("should call api.queryIcrcBalance with a query and an update call", async () => {
    vi.spyOn(icrcLegerApi, "queryIcrcToken").mockResolvedValue(mockCkBTCToken);

    const spyQuery = vi
      .spyOn(icrcLegerApi, "queryIcrcBalance")
      .mockResolvedValue(mockCkBTCMainAccount.balanceUlps);

    await services.syncIcrcAccountsBalances(params);

    await runResolvedPromises();

    for (const canisterId of [
      CKBTC_UNIVERSE_CANISTER_ID,
      CKTESTBTC_UNIVERSE_CANISTER_ID,
    ]) {
      expect(spyQuery).toHaveBeenCalledWith(
        expect.objectContaining({ canisterId, certified: false })
      );
      expect(spyQuery).toHaveBeenCalledWith(
        expect.objectContaining({ canisterId, certified: true })
      );
    }
    expect(spyQuery).toHaveBeenCalledTimes(4);
  });

  it("should store the certified balance and not the query answer", async () => {
    const queryBalanceUlps = 1n;
    const certifiedBalanceUlps = 2n;

    vi.spyOn(icrcLegerApi, "queryIcrcToken").mockResolvedValue(mockCkBTCToken);
    vi.spyOn(icrcLegerApi, "queryIcrcBalance").mockImplementation(
      async ({ certified }) =>
        certified ? certifiedBalanceUlps : queryBalanceUlps
    );

    await services.syncIcrcAccountsBalances(params);

    await runResolvedPromises();

    const store = get(icrcAccountsStore);
    expect(store[CKBTC_UNIVERSE_CANISTER_ID.toText()]).toMatchObject({
      certified: true,
    });
    expect(
      store[CKBTC_UNIVERSE_CANISTER_ID.toText()].accounts[0].balanceUlps
    ).toEqual(certifiedBalanceUlps);
  });

  it("should call api.getToken and load the certified token in store", async () => {
    const spyQuery = vi
      .spyOn(icrcLegerApi, "queryIcrcToken")
      .mockResolvedValue(mockCkBTCToken);

    vi.spyOn(icrcLegerApi, "queryIcrcBalance").mockResolvedValue(
      mockCkBTCMainAccount.balanceUlps
    );

    await services.syncIcrcAccountsBalances(params);

    await runResolvedPromises();

    const store = get(ckBTCTokenStore);
    const token = {
      token: mockCkBTCToken,
      certified: true,
    };
    expect(store).toEqual({
      [CKBTC_UNIVERSE_CANISTER_ID.toText()]: token,
      [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: token,
    });

    expect(spyQuery).toBeCalled();
  });

  it("should toast error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(icrcLegerApi, "queryIcrcToken").mockResolvedValue(mockCkBTCToken);
    vi.spyOn(icrcLegerApi, "queryIcrcBalance").mockRejectedValue(new Error());

    await services.syncIcrcAccountsBalances(params);

    await runResolvedPromises();

    expect(toastsError).toHaveBeenCalled();
  });
});
