/**
 * @jest-environment jsdom
 */

import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import CkBTCWallet from "$lib/pages/CkBTCWallet.svelte";
import { loadCkBTCAccounts } from "$lib/services/ckbtc-accounts.services";
import { ckBTCAccountsStore } from "$lib/stores/ckbtc-accounts.store";
import { page } from "$mocks/$app/stores";
import { render, waitFor } from "@testing-library/svelte";
import { mockCkBTCMainAccount } from "../../mocks/ckbtc-accounts.mock";
import en from "../../mocks/i18n.mock";

jest.mock("$lib/services/ckbtc-accounts.services", () => {
  return {
    loadCkBTCAccounts: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/services/ckbtc-transactions.services", () => {
  return {
    loadCkBTCAccountNextTransactions: jest.fn().mockResolvedValue(undefined),
  };
});

describe("CkBTCWallet", () => {
  const props = {
    accountIdentifier: mockCkBTCMainAccount.identifier,
  };

  describe("accounts not loaded", () => {
    beforeAll(() => {
      ckBTCAccountsStore.reset();

      page.mock({
        data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
        routeId: AppPath.Wallet,
      });
    });

    it("should render a spinner while loading", () => {
      const { getByTestId } = render(CkBTCWallet, props);

      expect(getByTestId("spinner")).not.toBeNull();
    });

    it("should call to load ckBTC accounts", async () => {
      render(CkBTCWallet, props);

      await waitFor(() => expect(loadCkBTCAccounts).toBeCalled());
    });
  });

  describe("accounts loaded", () => {
    beforeAll(() => {
      ckBTCAccountsStore.set({
        accounts: [mockCkBTCMainAccount],
        certified: true,
      });

      page.mock({
        data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
        routeId: AppPath.Wallet,
      });
    });

    afterAll(() => jest.clearAllMocks());

    it("should render ckBTC name", async () => {
      const { getByTestId } = render(CkBTCWallet, props);

      await waitFor(() => {
        const titleRow = getByTestId("projects-summary");
        expect(titleRow).not.toBeNull();
        expect(titleRow?.textContent?.includes(en.ckbtc.title)).toBeTruthy();
      });
    });

    it("should hide spinner when selected account is loaded", async () => {
      const { queryByTestId } = render(CkBTCWallet, props);

      await waitFor(() => expect(queryByTestId("spinner")).toBeNull());
    });

    it("should render wallet summary", async () => {
      const { queryByTestId } = render(CkBTCWallet, props);

      await waitFor(() =>
        expect(queryByTestId("wallet-summary")).toBeInTheDocument()
      );
    });
  });
});
