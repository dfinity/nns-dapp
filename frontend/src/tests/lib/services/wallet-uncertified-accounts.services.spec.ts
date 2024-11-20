import * as icrcLegerApi from "$lib/api/icrc-ledger.api";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { universesAccountsBalance } from "$lib/derived/universes-accounts-balance.derived";
import { ckBTCTokenStore } from "$lib/derived/universes-tokens.derived";
import * as services from "$lib/services/wallet-uncertified-accounts.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import * as toastsStore from "$lib/stores/toasts.store";
import { toastsError } from "$lib/stores/toasts.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import { get } from "svelte/store";

describe("wallet-uncertified-accounts.services", () => {
  beforeEach(() => {
    resetIdentity();
    icrcAccountsStore.reset();
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

    await services.uncertifiedLoadAccountsBalance(params);

    const store = get(universesAccountsBalance);
    // Nns + ckBTC + ckTESTBTC
    expect(Object.keys(store)).toHaveLength(3);
    expect(store[CKBTC_UNIVERSE_CANISTER_ID.toText()]).toEqual(
      mockCkBTCMainAccount.balanceUlps
    );
    expect(spyQuery).toBeCalled();
  });

  it("should call api.getToken and load token in store", async () => {
    const spyQuery = vi
      .spyOn(icrcLegerApi, "queryIcrcToken")
      .mockResolvedValue(mockCkBTCToken);

    vi.spyOn(icrcLegerApi, "queryIcrcBalance").mockResolvedValue(
      mockCkBTCMainAccount.balanceUlps
    );

    await services.uncertifiedLoadAccountsBalance(params);

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
    vi.spyOn(icrcLegerApi, "queryIcrcToken").mockResolvedValue(mockCkBTCToken);
    vi.spyOn(icrcLegerApi, "queryIcrcBalance").mockRejectedValue(new Error());

    await services.uncertifiedLoadAccountsBalance(params);

    expect(toastsError).toHaveBeenCalled();
  });
});
