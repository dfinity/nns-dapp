import * as ledgerApi from "$lib/api/ckbtc-ledger.api";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import * as minterServices from "$lib/services/ckbtc-minter.services";
import { loadCkBTCWithdrawalAccount } from "$lib/services/ckbtc-withdrawal-accounts.services";
import { ckBTCWithdrawalAccountsStore } from "$lib/stores/ckbtc-withdrawal-accounts.store";
import {
  mockCkBTCWithdrawalAccount,
  mockCkBTCWithdrawalIcrcAccount,
} from "$tests/mocks/ckbtc-accounts.mock";
import {
  mockedConstants,
  resetMockedConstants,
} from "$tests/utils/mockable-constants.test-utils";
import { tick } from "svelte";
import { get } from "svelte/store";

describe("ckbtc-withdrawal-accounts.services", () => {
  describe("loadCkBTCWithdrawalAccount", () => {
    beforeEach(() => {
      resetMockedConstants();
      vi.clearAllMocks();
      ckBTCWithdrawalAccountsStore.reset();
      vi.spyOn(console, "error").mockReturnValue();
    });

    const spyGetWithdrawalAccount = vi
      .spyOn(minterServices, "getWithdrawalAccount")
      .mockResolvedValue({
        owner: mockCkBTCWithdrawalIcrcAccount.owner,
        subaccount: [mockCkBTCWithdrawalIcrcAccount.subaccount],
      });

    it("should call api.getCkBTCAccount and load neurons in store", async () => {
      const spyGetCkBTCAccount = vi
        .spyOn(ledgerApi, "getCkBTCAccount")
        .mockResolvedValue(mockCkBTCWithdrawalAccount);

      await loadCkBTCWithdrawalAccount({
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      });

      await tick();

      expect(spyGetCkBTCAccount).toHaveBeenCalled();

      expect(spyGetWithdrawalAccount).toHaveBeenCalled();

      const store = get(ckBTCWithdrawalAccountsStore);

      expect(store[CKBTC_UNIVERSE_CANISTER_ID.toText()]).not.toBeUndefined();
      expect(
        store[CKBTC_UNIVERSE_CANISTER_ID.toText()].account.identifier
      ).toEqual(mockCkBTCWithdrawalAccount.identifier);
    });

    it("should not be affected by FORCE_CALL_STRATEGY", async () => {
      mockedConstants.FORCE_CALL_STRATEGY = "query";
      const spyGetCkBTCAccount = vi
        .spyOn(ledgerApi, "getCkBTCAccount")
        .mockResolvedValue(mockCkBTCWithdrawalAccount);

      await loadCkBTCWithdrawalAccount({
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      });

      await tick();

      expect(spyGetCkBTCAccount).toHaveBeenCalled();

      expect(spyGetWithdrawalAccount).toHaveBeenCalled();

      const store = get(ckBTCWithdrawalAccountsStore);

      expect(store[CKBTC_UNIVERSE_CANISTER_ID.toText()]).not.toBeUndefined();
      expect(
        store[CKBTC_UNIVERSE_CANISTER_ID.toText()].account.identifier
      ).toEqual(mockCkBTCWithdrawalAccount.identifier);
    });

    it("should empty store if update call fails", async () => {
      ckBTCWithdrawalAccountsStore.set({
        account: {
          account: mockCkBTCWithdrawalAccount,
          certified: true,
        },
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      });

      vi.spyOn(ledgerApi, "getCkBTCAccount").mockImplementation(() =>
        Promise.reject(undefined)
      );

      await loadCkBTCWithdrawalAccount({
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      });

      const store = get(ckBTCWithdrawalAccountsStore);
      expect(store[CKBTC_UNIVERSE_CANISTER_ID.toText()]).toBeUndefined();
    });
  });
});
