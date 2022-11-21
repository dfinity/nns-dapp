/**
 * @jest-environment jsdom
 */

import { snsProjectSelectedStore } from "$lib/derived/selected-project.derived";
import { snsProjectAccountsStore } from "$lib/derived/sns/sns-project-accounts.derived";
import SnsAccounts from "$lib/pages/SnsAccounts.svelte";
import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { formatToken } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import { render, waitFor } from "@testing-library/svelte";
import type { Subscriber } from "svelte/store";
import { mockPrincipal } from "../../mocks/auth.store.mock";
import { mockStoreSubscribe } from "../../mocks/commont.mock";
import en from "../../mocks/i18n.mock";
import {
  mockSnsAccountsStoreSubscribe,
  mockSnsMainAccount,
} from "../../mocks/sns-accounts.mock";
import { mockSnsFullProject, mockSummary } from "../../mocks/sns-projects.mock";

jest.mock("$lib/services/sns-accounts.services", () => {
  return {
    syncSnsAccounts: jest.fn().mockResolvedValue(undefined),
  };
});

describe("SnsAccounts", () => {
  describe("when there are accounts in the store", () => {
    beforeEach(() => {
      jest
        .spyOn(snsAccountsStore, "subscribe")
        .mockImplementation(mockSnsAccountsStoreSubscribe(mockPrincipal));

      jest
        .spyOn(snsProjectSelectedStore, "subscribe")
        .mockImplementation(mockStoreSubscribe(mockSnsFullProject));

      page.mock({ data: { universe: mockPrincipal.toText() } });
    });

    it("should render accounts title", () => {
      const { getByTestId } = render(SnsAccounts);

      expect(getByTestId("accounts-title")).toBeInTheDocument();
    });

    it("should load accounts and transaction fee", () => {
      render(SnsAccounts);

      expect(syncSnsAccounts).toHaveBeenCalled();
    });

    it("should contain a tooltip", () => {
      const { container } = render(SnsAccounts);

      expect(container.querySelector(".tooltip-wrapper")).toBeInTheDocument();
    });

    it("should render a main Account", async () => {
      const { getByText } = render(SnsAccounts);

      await waitFor(() =>
        expect(getByText(en.accounts.main)).toBeInTheDocument()
      );
    });

    it("should render account cards", async () => {
      const { getAllByTestId } = render(SnsAccounts);

      await waitFor(() =>
        expect(getAllByTestId("account-card").length).toBeGreaterThan(0)
      );
    });

    it("should load sns accounts of the project", () => {
      render(SnsAccounts);

      expect(syncSnsAccounts).toHaveBeenCalledWith(mockPrincipal);
    });

    it("should render total accounts sns project", async () => {
      const { getByTestId } = render(SnsAccounts);

      const titleRow = getByTestId("accounts-summary");

      // we are testing with only one account so we can use it to check the total is displayed
      await waitFor(() =>
        expect(
          titleRow?.textContent?.includes(
            `${formatToken({ value: mockSnsMainAccount.balance.toE8s() })} ${
              mockSnsMainAccount.balance.token.symbol
            }`
          )
        ).toBeTruthy()
      );
    });

    it("should render sns project name", async () => {
      const { getByTestId } = render(SnsAccounts);

      const titleRow = getByTestId("accounts-summary");

      expect(
        titleRow?.textContent?.includes(mockSummary.metadata.name)
      ).toBeTruthy();
    });

    it("should render sns project logo", async () => {
      const { getByTestId } = render(SnsAccounts);

      const img = getByTestId("accounts-logo");

      expect(img?.getAttribute("src") ?? "").toEqual(mockSummary.metadata.logo);
    });
  });

  describe("when no accounts", () => {
    beforeEach(() => {
      jest
        .spyOn(snsProjectAccountsStore, "subscribe")
        .mockImplementation((run: Subscriber<undefined>): (() => void) => {
          run(undefined);
          return () => undefined;
        });
    });
    it("should not render a token amount component nor zero", () => {
      const { container } = render(SnsAccounts);

      // Tooltip wraps the amount
      expect(
        container.querySelector(".tooltip-wrapper")
      ).not.toBeInTheDocument();
    });
  });
});
