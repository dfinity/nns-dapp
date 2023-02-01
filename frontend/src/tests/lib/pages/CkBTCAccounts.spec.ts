/**
 * @jest-environment jsdom
 */

import CkBTCAccounts from "$lib/pages/CkBTCAccounts.svelte";
import { loadCkBTCAccounts } from "$lib/services/ckbtc-accounts.services";
import { ckBTCAccountsStore } from "$lib/stores/ckbtc-accounts.store";
import { render, waitFor } from "@testing-library/svelte";
import { mockCkBTCMainAccount } from "../../mocks/ckbtc-accounts.mock";
import en from "../../mocks/i18n.mock";

jest.mock("$lib/services/ckbtc-accounts.services", () => {
  return {
    loadCkBTCAccounts: jest.fn().mockResolvedValue(undefined),
  };
});

describe("CkBTCAccounts", () => {
  describe("when there are accounts in the store", () => {
    beforeAll(() => {
      ckBTCAccountsStore.set({
        accounts: [mockCkBTCMainAccount],
        certified: true,
      });
    });

    it("should not load ckBTC accounts", () => {
      render(CkBTCAccounts);

      expect(loadCkBTCAccounts).not.toHaveBeenCalled();
    });

    it("should render a main Account", async () => {
      const { getByText } = render(CkBTCAccounts);

      await waitFor(() =>
        expect(getByText(en.accounts.main)).toBeInTheDocument()
      );
    });

    it("should render account cards", async () => {
      const { getAllByTestId } = render(CkBTCAccounts);

      await waitFor(() =>
        expect(getAllByTestId("account-card").length).toBeGreaterThan(0)
      );
    });
  });

  describe("when no accounts", () => {
    beforeAll(() => {
      ckBTCAccountsStore.reset();
    });

    it("should call load ckBTC accounts", () => {
      render(CkBTCAccounts);

      expect(loadCkBTCAccounts).toHaveBeenCalled();
    });

    it("should render skeletons while loading", () => {
      const { container } = render(CkBTCAccounts);
      expect(
        container.querySelector('[data-tid="skeleton-card"]')
      ).not.toBeNull();
    });
  });
});
