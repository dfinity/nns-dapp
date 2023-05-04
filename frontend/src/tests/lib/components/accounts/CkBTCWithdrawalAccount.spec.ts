/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/ckbtc-ledger.api";
import CkBTCWithdrawalAccount from "$lib/components/accounts/CkBTCWithdrawalAccount.svelte";
import { CKTESTBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import * as minterServices from "$lib/services/ckbtc-minter.services";
import { authStore } from "$lib/stores/auth.store";
import { ckBTCWithdrawalAccountsStore } from "$lib/stores/ckbtc-withdrawal-accounts.store";
import { page } from "$mocks/$app/stores";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import {
  mockCkBTCWithdrawalAccount,
  mockCkBTCWithdrawalIcrcAccount,
} from "$tests/mocks/ckbtc-accounts.mock";
import { render, waitFor } from "@testing-library/svelte";

describe("CkBTCWithdrawalAccount", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    jest.spyOn(console, "error").mockImplementation(() => undefined);

    ckBTCWithdrawalAccountsStore.reset();

    page.mock({
      data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Accounts,
    });

    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  describe("loading error", () => {
    beforeEach(() => {
      jest.spyOn(minterServices, "getWithdrawalAccount").mockResolvedValue({
        owner: mockCkBTCWithdrawalIcrcAccount.owner,
        subaccount: [mockCkBTCWithdrawalIcrcAccount.subaccount],
      });

      jest
        .spyOn(minterServices, "getWithdrawalAccount")
        .mockRejectedValue(new Error());
    });

    it("should not render a button if no account", () => {
      const { getByTestId } = render(CkBTCWithdrawalAccount);

      expect(() => getByTestId("open-restart-convert-ckbtc-to-btc")).toThrow();
    });
  });

  describe("getCkBTCAccount returns a valid account", () => {
    let spyGetCkBTCAccount;

    beforeEach(() => {
      spyGetCkBTCAccount = jest
        .spyOn(ledgerApi, "getCkBTCAccount")
        .mockResolvedValue(mockCkBTCWithdrawalAccount);
    });

    describe("account is already loaded", () => {
      beforeEach(() => {
        ckBTCWithdrawalAccountsStore.set({
          account: {
            account: mockCkBTCWithdrawalAccount,
            certified: true,
          },
          universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
        });
      });

      it("should render a button if a matching account is loaded", async () => {
        const { getByTestId } = render(CkBTCWithdrawalAccount);

        await waitFor(() =>
          expect(
            getByTestId("open-restart-convert-ckbtc-to-btc")
          ).toBeInTheDocument()
        );
      });

      it("should not get account if a matching account is already loaded", async () => {
        render(CkBTCWithdrawalAccount);

        await waitFor(() => expect(spyGetCkBTCAccount).not.toHaveBeenCalled());
      });
    });

    describe("account is not yet loaded", () => {
      beforeEach(() => {
        jest.spyOn(minterServices, "getWithdrawalAccount").mockResolvedValue({
          owner: mockCkBTCWithdrawalIcrcAccount.owner,
          subaccount: [mockCkBTCWithdrawalIcrcAccount.subaccount],
        });
      });

      it("should render a button if when account is loaded", async () => {
        const { getByTestId } = render(CkBTCWithdrawalAccount);

        await waitFor(() =>
          expect(
            getByTestId("open-restart-convert-ckbtc-to-btc")
          ).toBeInTheDocument()
        );
      });

      it("should get account", async () => {
        render(CkBTCWithdrawalAccount);

        await waitFor(() => expect(spyGetCkBTCAccount).toHaveBeenCalled());
      });
    });
  });
});
